import { Card } from "../card";
import { CardSelectorHelper } from "../helpers/card_selector_helper";
import { PlayerHelper } from "../helpers/player_helper";
import { LogLevel } from "../logging/game_log";
import { Player } from "../player";
import {
  HeuristicType,
  TerminalType,
  CardSelectorCriteria,
} from "./card_selector_types";
export {
  HeuristicType,
  TerminalType,
  CardSelectorCriteria,
} from "./card_selector_types";

export class CardSelector {
  player: Player;
  /* This selector supports "up to X" and "exactly X" selection decisions
   *
   * The `criteriaList` is used to satisfy "up to X" selections
   * Then, in the cases where selections are required, the `requiredCriteriaList`
   *   is applied until the required selections are made, or all of the all cards have been selected
   */
  criteriaList: CardSelectorCriteria[];
  requiredCriteriaList: CardSelectorCriteria[] | undefined;
  constructor(
    player: Player,
    criteriaList: CardSelectorCriteria[],
    requiredCriteriaList?: CardSelectorCriteria[],
  ) {
    this.player = player;
    this.criteriaList = criteriaList;
    this.requiredCriteriaList = requiredCriteriaList;
  }

  getCardsFromCriteria(
    searchMap: Map<string, Card[]>,
    choices: number, // optional amount to be selected before selecting any addtl. required
    required: number = 0,
    pickAnyCardAfterCriteria: boolean = true, // if required is set, fill it with random cards if true
  ): Card[] {
    const selectedCards = new Array();

    while (choices > 0) {
      const selectedCard = this.getCardFromCriteria(
        searchMap,
        this.criteriaList,
        selectedCards,
      );
      if (!selectedCard) {
        break;
      } else {
        selectedCards.push(selectedCard);
        choices--;
        required--;
      }
    }

    while (required > 0) {
      let selectedCard: Card | undefined;
      // apply the optional criteria list first if provided (implicitly this is the "preferred" list)
      if (this.criteriaList.length > 0) {
        selectedCard = this.getCardFromCriteria(
          searchMap,
          this.criteriaList,
          selectedCards,
        );
      }
      if (!selectedCard) {
        if (this.requiredCriteriaList) {
          selectedCard = this.getCardFromCriteria(
            searchMap,
            this.requiredCriteriaList,
            selectedCards,
          );
          if (!selectedCard) {
            if (pickAnyCardAfterCriteria) {
              selectedCard = this.getAnyCard(searchMap);
            }
            if (!selectedCard) {
              // empty hand or otherwise no applicable matches
              break;
            }
          }
        }
      }
      if (!selectedCard) {
        throw new Error(
          "card selector function should have broken, but did not.",
        );
      } else {
        selectedCards.push(selectedCard);
        choices--;
        required--;
      }
    }

    return selectedCards;
  }

  private getAnyCard(searchMap: Map<string, Card[]>): Card | undefined {
    for (const cardStack of searchMap.values()) {
      return cardStack[0];
    }
    return undefined;
  }

  getCardFromCriteria(
    searchMap: Map<string, Card[]>,
    criteriaList: CardSelectorCriteria[],
    alreadySelectedCards?: undefined | Card[],
  ): Card | undefined {
    for (const criteria of criteriaList) {
      const matchList: Card[] = []; // collect all candidates if criteria.sortFn defined
      for (const cardStack of searchMap.values()) {
        const logline = `Checking criteria '${criteria.cardName} ${criteria.heuristicType} ${criteria.alwaysSelect} ${criteria.terminalType} ${criteria.actionsGE} ${criteria.type}' for matching with ${cardStack[0].name}`;
        this.player.game.gamelog.log(logline, LogLevel.EXTREME);
        if (this.matches(cardStack[0], criteria, alreadySelectedCards)) {
          this.player.game.gamelog.log("Match found", LogLevel.EXTREME);
          if (alreadySelectedCards) {
            for (let cardPos = 0; cardPos < cardStack.length; cardPos++) {
              if (!alreadySelectedCards.includes(cardStack[cardPos])) {
                if (criteria.sortByValueFn) {
                  matchList.push(cardStack[cardPos]);
                } else {
                  return cardStack[cardPos];
                }
              }
            }
          } else {
            if (criteria.sortByValueFn) {
              matchList.push(cardStack[0]);
            } else {
              return cardStack[0];
            }
          }
        }
      }
      if (matchList.length > 0 && criteria.sortByValueFn) {
        return this.highest(matchList, criteria.sortByValueFn);
      }
    }
    return undefined;
  }

  private matches(
    card: Card,
    selectionCriteria: CardSelectorCriteria,
    alreadySelectedCards: undefined | Card[],
  ): boolean {
    if (selectionCriteria.alwaysSelect === true) {
      return true;
    }
    if (selectionCriteria.actionsGE) {
      if (
        this.player.game.currentPlayer.actions < selectionCriteria.actionsGE
      ) {
        return false;
      }
    }

    if (selectionCriteria.cardName) {
      if (selectionCriteria.cardName !== card.name) {
        return false;
      }
    }

    if (selectionCriteria.type) {
      if (!card.types.includes(selectionCriteria.type)) {
        return false;
      }
    }

    if (selectionCriteria.terminalType) {
      if (selectionCriteria.terminalType !== card.terminalType()) {
        return false;
      }
    }

    if (selectionCriteria.heuristicType) {
      if (selectionCriteria.heuristicType !== card.heuristicType()) {
        return false;
      }
    }

    if (selectionCriteria.drawCriteria) {
      if (selectionCriteria.drawCriteria.atLeastOne) {
        if (
          card.drawHeuristicValue(this.player) < 1 ||
          PlayerHelper.totalDrawableCards(this.player) < 1
        ) {
          return false;
        }
      }
      if (selectionCriteria.drawCriteria.allPotential) {
        const cardDraws = card.drawHeuristicValue(this.player);
        const totalDrawable = PlayerHelper.totalDrawableCards(this.player);
        if (cardDraws > totalDrawable) {
          return false;
        }
      }
    }

    if (
      selectionCriteria.doNotSelectIfEconomyBelow &&
      !this.economyOKafterTrashing(
        selectionCriteria.doNotSelectIfEconomyBelow,
        card,
        alreadySelectedCards,
      )
    ) {
      return false;
    }
    return true;
  }

  private highest(
    cards: Card[],
    sortByValueFn: (card: Card, player: Player) => number,
  ): Card | undefined {
    let currentHighest: Card | undefined = undefined;
    let currentHighestValue = -100;

    for (let cardPos = 0; cardPos < cards.length; cardPos++) {
      const currentValue = sortByValueFn(cards[cardPos], this.player);
      if (!currentHighest || currentValue > currentHighestValue) {
        currentHighest = cards[cardPos];
        currentHighestValue = currentValue;
      }
    }

    return currentHighest;
  }

  private economyOKafterTrashing(
    doNotSelectIfEconomyBelow: number,
    card: Card,
    alreadySelectedCards: Card[] | undefined,
  ): boolean {
    let totalEconomyRemoval = 0;
    totalEconomyRemoval += card.economyHeuristicValue();
    if (alreadySelectedCards) {
      for (const selectedCard of alreadySelectedCards) {
        totalEconomyRemoval += selectedCard.economyHeuristicValue();
      }
    }
    if (
      CardSelectorHelper.countTotalEconomy(this.player) - totalEconomyRemoval <
      doNotSelectIfEconomyBelow
    ) {
      return false;
    }
    return true;
  }
}
