import { Card } from "../card";
import { CardSelectorHelper } from "../helpers/card_selector_helper";
import { Player } from "../player";

export enum TerminalType {
  TERMINAL = "TERMINAL",
  NONTERMINAL = "NONTERMINAL",
  NONPLAYABLE = "NONPLAYABLE",
}

export enum HeuristicType {
  TREASURE = 0,
  CANTRIP = 1,
  DRAW = 2,
  DRAW_TO_X = 3,
  PAYLOAD_COINS = 4,
  FROM_DECK_SIFTER = 5,
  FROM_HAND_SIFTER = 6,
  VILLAGE = 7,
  PAYLOAD_GAINER = 8,
  VICTORY = 9,
  TRASHER = 10,
  JUNK = 11,
}

export class CardSelector {
  player: Player;
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
    choices: number,
    required: number = 0,
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
      let selectedCard = this.getCardFromCriteria(
        searchMap,
        this.criteriaList,
        selectedCards,
      );
      if (!selectedCard) {
        if (this.requiredCriteriaList) {
          selectedCard = this.getCardFromCriteria(
            searchMap,
            this.requiredCriteriaList,
            selectedCards,
          );
          if (!selectedCard) {
            selectedCard = this.getAnyCard(searchMap);
            if (!selectedCard) {
              // empty hand
              break;
            }
          }
        }
      }
      if (!selectedCard) {
        throw new Error("function should have broken, but did not.");
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
    for (const cardStack of searchMap.values()) {
      for (const criteria of criteriaList) {
        if (this.matches(cardStack[0], criteria, alreadySelectedCards)) {
          if (alreadySelectedCards) {
            for (let cardPos = 0; cardPos < cardStack.length; cardPos++) {
              if (!alreadySelectedCards.includes(cardStack[cardPos])) {
                return cardStack[cardPos];
              }
            }
          } else {
            return cardStack[0];
          }
        }
      }
    }
  }

  private matches(
    card: Card,
    selectionCriteria: CardSelectorCriteria,
    alreadySelectedCards: undefined | Card[],
  ): boolean {
    if (
      selectionCriteria.cardName === card.name &&
      (selectionCriteria.doNotSelectIfEconomyBelow === undefined ||
        this.economyOKafterTrashing(
          selectionCriteria.doNotSelectIfEconomyBelow,
          card,
          alreadySelectedCards,
        ))
    ) {
      return true;
    } else if (
      // NOTE: if adding new CardSelectorCriteria the must be added to this first check that ensures not all relevant criteria are left undefined
      (selectionCriteria.heuristicType !== undefined ||
        selectionCriteria.terminalType !== undefined) &&
      (selectionCriteria.heuristicType === undefined ||
        (selectionCriteria.heuristicType === card.heuristicType() &&
          selectionCriteria.terminalType === undefined) ||
        selectionCriteria.heuristicType === card.heuristicType()) &&
      (selectionCriteria.doNotSelectIfEconomyBelow === undefined ||
        this.economyOKafterTrashing(
          selectionCriteria.doNotSelectIfEconomyBelow,
          card,
          alreadySelectedCards,
        ))
    ) {
      return true;
    }
    return false;
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

export type CardSelectorCriteria = {
  cardName?: string | undefined;
  terminalType?: TerminalType | undefined;
  heuristicType?: HeuristicType | undefined;
  doNotSelectIfEconomyBelow?: number | undefined;
};
