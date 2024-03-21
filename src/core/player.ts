import { Card } from "./card";
import { CardType, DurationPhase } from "./card_types";
import { Copper } from "./cards/basic/copper";
import { Estate } from "./cards/basic/estate";
import { NullCard } from "./cards/basic/null_card";
import { Decision, DecisionType } from "./decisions";
import { EffectPlayer } from "./effects";
import { Game, Phase } from "./game";
import { PlayerHelper } from "./helpers/player_helper";
import { EventRecordBuilder } from "./logging/event_record_builders";
import { MetricHelper } from "./logic/metric_helpers";
import {
  ConditionSetList,
  OrderedConditionGainSelector,
} from "./logic/ordered_condition_gaining";
import { EffectResolver } from "./resolvers/effect_resolver";

export class Player {
  /*
   * Contains the core capabilities of the player needed to play the game
   * All cards belonging to the player are tracked and managed here
   * Override points for decisions made by the player are also defined here
   *
   * EffectResolver contains implementations for resolving effects and decisions
   * (manipulating and logging the game state while prodding the player for decisions)
   *
   * Logic regarding decisions does not belong here
   * and should be in the PlayerHelper / Card classes
   */
  name: string;
  game: Game;

  allCardsList: Card[];
  allCardsMap: Map<string, Card[]>;
  hand: Map<string, Card[]>;
  inPlay: Card[];
  deck: Card[];
  discard: Card[];
  opponent: Player | undefined;

  actions: number = 1;
  buys: number = 1;
  coins: number = 0;
  effectResolver = new EffectResolver();
  selector: OrderedConditionGainSelector;

  constructor(name: string, game: Game, gainRules?: ConditionSetList) {
    this.name = name;
    this.game = game;
    this.selector = this.loadSelectorFromConditionSet(gainRules);
    this.hand = new Map();
    this.inPlay = [];
    this.discard = [];
    this.allCardsList = [];
    this.allCardsMap = new Map();
    this.deck = this.defaultStartingDeck();

    this.drawHand();
    this.startTurn();
  }

  startTurn() {
    this.game.phase = Phase.START;
    this.actions = 1;
    this.buys = 1;
    this.coins = 0;

    this.playStartCards();
  }

  setOpponent(opponent: Player) {
    this.opponent = opponent;
  }

  addToAllCards(card: Card) {
    this.allCardsList.push(card);

    const in_deck_already = this.allCardsMap.get(card.name);
    if (!in_deck_already) {
      this.allCardsMap.set(card.name, [card]);
    } else {
      in_deck_already.push(card);
    }
  }

  removeFromAllCards(card: Card) {
    this.removeCardFromList(card, this.allCardsList);
    const in_deck_stack = this.allCardsMap.get(card.name);
    if (!in_deck_stack) {
      throw new Error(
        `Deck stack does not exists for card to remove: ${card.name}`,
      );
    }
    if (in_deck_stack.length > 1) {
      this.removeCardFromList(card, in_deck_stack);
    } else {
      this.allCardsMap.delete(card.name);
    }
  }

  private removeCardFromList(card: Card, list: Card[]) {
    const index = list.indexOf(card, 0);
    if (index > -1) {
      list.splice(index, 1);
    }
  }

  defaultStartingDeck(): Card[] {
    const deck: Card[] = [];
    for (let i = 0; i < 7; i++) {
      const copper = new Copper();
      deck.push(copper);
      this.addToAllCards(copper);
    }
    for (let i = 0; i < 3; i++) {
      const estate = new Estate();
      deck.push(estate);
      this.addToAllCards(estate);
    }
    return this.shuffledDeck(deck);
  }

  shuffledDeck = (deck: Card[]) => {
    // fisher-yates sorting algorithm
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  drawCard(): Card | undefined {
    if (this.deck.length == 0 && this.discard.length > 0) {
      this.game.gamelog.shuffleDeck(this);
      this.deck = this.shuffledDeck(this.discard);
      this.discard = [];
    }
    const cardDrawn = this.deck.pop();
    if (cardDrawn) {
      this.game.gamelog.logDraw(this, cardDrawn);
      this.addCardToHand(cardDrawn);
      return cardDrawn;
    }
  }

  addCardToHand(card: Card) {
    const in_hand_already = this.hand.get(card.name);
    if (!in_hand_already) {
      this.hand.set(card.name, [card]);
    } else {
      in_hand_already.push(card);
    }
  }

  removeCardFromHand(card: Card) {
    const in_hand = this.hand.get(card.name);
    if (!in_hand) {
      throw new Error("Attempting to remove card that is not in hand");
    } else {
      this.removeCardFromList(card, in_hand);
      if (in_hand.length === 0) {
        this.hand.delete(card.name);
      }
    }
  }

  placeHandInDiscard() {
    for (const card_stack of this.hand.values()) {
      while (card_stack.length > 0) {
        const card = card_stack[0];
        this.removeCardFromHand(card);
        this.discard.push(card);
        this.game.gamelog.logDiscardFromHandCleanup(this, card);
      }
    }
  }

  placeInPlayInDiscard() {
    const stayInPlay: Card[] = [];
    for (const card of this.inPlay) {
      if (card.staysInPlay()) {
        stayInPlay.push(card);
      } else {
        if (card.durationPhase) {
          card.durationPhase = DurationPhase.REMAINS_IN_PLAY;
        }
        this.game.gamelog.logDiscardFromPlayCleanup(this, card);
        this.discard.push(card);
      }
    }
    this.inPlay = stayInPlay;
  }

  drawHand() {
    for (let i = 0; i < 5; i++) {
      this.drawCard();
    }
  }

  topdeck(card: Card) {
    this.deck.unshift(card);
  }

  playActionPhase() {
    this.game.phase = Phase.ACTION;
    let currentlySelectedAction: Card;
    while (this.actions > 0) {
      currentlySelectedAction = PlayerHelper.selectBestActionByHeuristic(this);
      if (currentlySelectedAction.name === NullCard.NAME) {
        break;
      }
      this.removeCardFromHand(currentlySelectedAction);
      this.actions--;
      this.effectResolver.playCard(this, currentlySelectedAction);
    }
  }

  playTreasurePhase() {
    this.game.phase = Phase.TREASURE;
    let currentlySelectedTreasure: Card;
    while (true) {
      currentlySelectedTreasure = PlayerHelper.selectAnyTreasure(this);
      if (currentlySelectedTreasure.name === NullCard.NAME) {
        break;
      }
      this.removeCardFromHand(currentlySelectedTreasure);
      this.effectResolver.playCard(this, currentlySelectedTreasure);
    }
  }

  playBuyPhase() {
    this.game.phase = Phase.BUY;
    let currentlySelectedCard: string;
    while (this.buys > 0) {
      currentlySelectedCard = this.gainCardDecision(
        new Decision(DecisionType.BUY_CARD, EffectPlayer.SELF),
      );
      if (currentlySelectedCard === NullCard.NAME) {
        break;
      } else {
        this.buys -= 1;
        const gained = this.effectResolver.gainCard(
          this,
          currentlySelectedCard,
        );
        this.coins -= MetricHelper.effectiveCostOfCard(this, gained);
      }
    }
  }

  playCleanupPhase() {
    this.game.phase = Phase.CLEAN_UP;
    this.placeInPlayInDiscard();
    this.placeHandInDiscard();
    this.drawHand();
  }

  private playStartCards() {
    for (const card of this.inPlay) {
      if (card.types.includes(CardType.DURATION)) {
        this.effectResolver.playDuration(this, card);
      }
    }
  }

  loadSelectorFromConditionSet(
    conditionSetList?: ConditionSetList,
  ): OrderedConditionGainSelector {
    // TODO Next load rules from conditionSetList if defined
    if (conditionSetList) {
      return PlayerHelper.createSelector(conditionSetList, this);
    }

    return PlayerHelper.defaultSelector(this);
  }

  makeDecision(decision: Decision) {
    PlayerHelper.makeDefaultDecision(this, decision);
  }

  // maybe TODO move this call point into the generalized makeDecision handler
  gainCardDecision(decision: Decision): string {
    if (decision.decisionType === DecisionType.BUY_CARD) {
      const toGain = this.selector.getGainName(this, this.coins);
      this.game.gamelog.logBuy(this, toGain);
      return toGain;
    } else if (decision.decisionType === DecisionType.GAIN_CARD_UP_TO) {
      if (!decision.amount) {
        throw new Error(
          "Decision amount required but not provided for gain effect",
        );
      }
      const decisionResult = this.selector.getGainName(this, decision.amount);
      decision.result = decisionResult;
      return decisionResult;
    } else {
      throw new Error(`Unsupported gain type: ${decision.decisionType}`);
    }
  }
}
