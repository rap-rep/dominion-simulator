import { Card, NULL_CARD_NAME } from "../card";
import { DeprecatedCardHeuristicType, CardType } from "../card_types";
import { Gear } from "../cards/adventures/gear";
import { Chapel } from "../cards/base/chapel";
import { Copper } from "../cards/basic/copper";
import { Curse } from "../cards/basic/curse";
import { Duchy } from "../cards/basic/duchy";
import { Estate } from "../cards/basic/estate";
import { Gold } from "../cards/basic/gold";
import { Province } from "../cards/basic/province";
import { Silver } from "../cards/basic/silver";
import { Watchtower } from "../cards/prosperity/watchtower";
import { Decision, DecisionType } from "../decisions";
import { EffectType } from "../effects";
import { EventRecord } from "../logging/event_query";
import { EventRecordBuilder } from "../logging/event_record_builders";
import {
  ConditionSetList,
  GainMetric,
  GainMetricFrontend,
  LogicalJoiner,
  LogicalJoinerFrontend,
  OrderedConditionGainSelector,
  OrderedGainCondition,
  ThresholdType,
} from "../logic/ordered_condition_gaining";
import { Player } from "../player";
import { SharedDefaultDecisions } from "./shared_decisions_helper";

const NULL_CARD = new Card(NULL_CARD_NAME, [CardType.NULL]);

export class PlayerHelper {
  static makeDefaultDecision(player: Player, decision: Decision) {
    /*
     * This is the huge and messy Decision switchboard. TODO move this
     * At this point the Decision could reference any type,
     * but the resolution (`Decision.result`) is required to be set by function end
     *
     * Implementation details for decisions do not go here
     */

    if (decision.decisionType === DecisionType.SELECT_EFFECT) {
      if (decision.fromCard.name === Watchtower.NAME) {
        PlayerHelper.watchtowerDecision(player, decision);
      } else {
        throw new Error(
          `${decision.decisionType} decision for card ${decision.fromCard.name} not implemented`,
        );
      }
    } else if (decision.decisionType === DecisionType.GAIN_CARD_UP_TO) {
      // TODO: Make this for the first condition for clarity
      player.gainCardDecision(decision);
    } else if (decision.decisionType === DecisionType.TRASH_FROM_HAND) {
      if (decision.fromCard.name === Chapel.NAME) {
        Chapel.defaultChapelDecision(player, decision);
      } else {
        throw new Error(
          `${decision.decisionType} decision for card ${decision.fromCard.name} not implemented`,
        );
      }
    } else if (decision.decisionType === DecisionType.SET_ASIDE_ON_FROM_HAND) {
      if (decision.fromCard.name === Gear.NAME) {
        Gear.defaultGearDecision(player, decision);
      } else {
        throw new Error(
          `${decision.decisionType} decision for card ${decision.fromCard.name} not implemented`,
        );
      }
    } else if (decision.decisionType === DecisionType.DISCARD_TO) {
      SharedDefaultDecisions.discardToDecision(player, decision);
    } else if (decision.decisionType === DecisionType.DISCARD) {
      SharedDefaultDecisions.discardDecision(player, decision);
    } else if (decision.decisionType === DecisionType.EXILE_DISCARD) {
      SharedDefaultDecisions.exileDiscardDecision(player, decision);
    } else {
      throw new Error(
        `Default decision for ${decision.decisionType} not implemented. From card: ${decision.fromCard.name}`,
      );
    }
  }

  static countVictoryPoints(player: Player) {
    let tally = 0;
    for (const card of player.allCardsList) {
      tally += card.victoryPoints();
    }
    return tally;
  }

  static getVPrecords(player: Player): EventRecord[] {
    const records = new Array();
    for (const card of player.allCardsList) {
      const vp = card.victoryPoints();
      if (vp) {
        records.push(EventRecordBuilder.vp(player, card, vp));
      }
    }
    return records;
  }

  static selectAnyAction(player: Player): Card {
    for (const card_stack of player.hand.values()) {
      if (card_stack[0].types.includes(CardType.ACTION)) {
        return card_stack[0];
      }
    }
    return NULL_CARD;
  }

  // TODO This really should have fine-grained unit testing
  static createSelector(
    conditionSetList: ConditionSetList,
    player: Player,
  ): OrderedConditionGainSelector {
    const selector = new OrderedConditionGainSelector(player);
    for (const conditionSet of conditionSetList.conditionSetList) {
      const outputConditions: OrderedGainCondition[] = new Array();
      for (const condition of conditionSet.conditionSet) {
        let joiner: LogicalJoiner = LogicalJoiner.NONE;
        if (condition.joiner) {
          if (condition.joiner === LogicalJoinerFrontend.AND) {
            joiner = LogicalJoiner.AND;
          } else if (condition.joiner === LogicalJoinerFrontend.OR) {
            joiner = LogicalJoiner.OR;
          } else {
            throw new Error(
              `Passed in unsupported logical joiner of ${condition.joiner}`,
            );
          }
        }

        if (condition.gainMetric === GainMetricFrontend.CAN_GAIN) {
          if (conditionSet.conditionSet.length > 1) {
            throw new Error("Can gain rules can only exist independently");
          }
          selector.addGainAlwaysCondition(conditionSet.cardToGain);
        } else if (
          condition.gainMetric === GainMetricFrontend.TURN ||
          condition.gainMetric === GainMetricFrontend.COINS_AVAILABLE
        ) {
          const gainMetric =
            condition.gainMetric === GainMetricFrontend.TURN
              ? GainMetric.TURN
              : GainMetric.COINS_AVAILABLE;
          outputConditions.push(
            new OrderedGainCondition(
              gainMetric,
              condition.comparator as ThresholdType,
              condition.amount,
              joiner,
              undefined,
              undefined,
              condition.cardList,
            ),
          );
        } else if (
          condition.gainMetric === GainMetricFrontend.CARD_IN_DECK_COUNT ||
          condition.gainMetric === GainMetricFrontend.DIFF_IN_DECK
        ) {
          outputConditions.push(
            new OrderedGainCondition(
              GainMetric.CARD_IN_DECK_COUNT,
              condition.comparator as ThresholdType,
              condition.amount,
              joiner,
              undefined,
              undefined,
              condition.cardList,
            ),
          );
        } else {
          throw new Error(`Unsupported gain metric: ${condition.gainMetric}`);
        }
      }

      if (outputConditions.length > 0) {
        selector.addConditionSet(outputConditions, conditionSet.cardToGain);
      }
    }
    return selector;
  }

  static selectBestActionByHeuristic(player: Player): Card {
    // TODO Make better - this is a basic, sloppy getting started implementation
    return (
      this.findFromPriorityList(player, [
        DeprecatedCardHeuristicType.NONTERMINAL_FROM_DECK_SIFTER,
        DeprecatedCardHeuristicType.NONTERMINAL_DRAW,
        DeprecatedCardHeuristicType.VILLAGE,
        DeprecatedCardHeuristicType.CANTRIP,
        DeprecatedCardHeuristicType.NONTERMINAL_HAND_SIFTER,
        DeprecatedCardHeuristicType.NONTERMINAL_GAINER,
        DeprecatedCardHeuristicType.NONTERMINAL_PAYLOAD,
        DeprecatedCardHeuristicType.TERMINAL_DRAW,
        DeprecatedCardHeuristicType.TERMINAL_FROM_DECK_SIFTER,
        DeprecatedCardHeuristicType.TERMINAL_PAYLOAD,
        DeprecatedCardHeuristicType.TRASHER,
        DeprecatedCardHeuristicType.TERMINAL_GAINER,
      ]) || NULL_CARD
    );
  }

  private static findFromPriorityList(
    player: Player,
    priorityList: DeprecatedCardHeuristicType[],
  ) {
    for (const heuristicType of priorityList) {
      const card = this.getCardOfHeuristicType(player, heuristicType);
      if (card) {
        return card;
      }
    }
    return undefined;
  }

  static selectAnyTreasure(player: Player): Card {
    for (const card_stack of player.hand.values()) {
      if (card_stack[0].types.includes(CardType.TREASURE)) {
        return card_stack[0];
      }
    }
    return NULL_CARD;
  }

  static getCardOfHeuristicType(
    player: Player,
    heuristicType: DeprecatedCardHeuristicType,
    alreadySelectedCard?: Card | undefined, // TODO make more resilient (really just for Gear right now and thus only works for one card)
  ): Card | undefined {
    for (const cardStack of player.hand.values()) {
      if (cardStack[0].deprecatedHeuristicType() === heuristicType) {
        if (alreadySelectedCard?.name === cardStack[0].name) {
          // if the card has already been selected, prevent re-selection of the same card
          if (cardStack.length > 1) {
            return cardStack[1];
          } else {
            continue;
          }
        } else {
          return cardStack[0];
        }
      }
    }
    return undefined;
  }

  static countOfCardInDeck(player: Player, card: string): number {
    return player.allCardsMap.get(card)?.length || 0;
  }

  static totalDrawableCards(player: Player): number {
    return player.deck.length + player.discard.length;
  }

  static diffOfCardsInDeck(
    player: Player,
    card1: string,
    card2: string,
  ): number {
    return (
      PlayerHelper.countOfCardInDeck(player, card1) -
      PlayerHelper.countOfCardInDeck(player, card2)
    );
  }

  // TODO: Move this into Watchtower class similar as Gear is done
  private static watchtowerDecision(player: Player, decision: Decision) {
    const effectMap = decision.selectionMap;
    if (!effectMap) {
      throw new Error(
        "decision.SelectionMap not defined, but selectEffectDecision called",
      );
    }

    for (let i = 0; i < effectMap.size; i++) {
      const effect = effectMap.get(i);

      if (!effect) {
        throw new Error(
          `Key error while accessing ${decision.selectionMap}, key ${i}`,
        );
      }

      const effectedCard = effect.affects as Card;
      if (
        effect.effectType === EffectType.TRASH_FROM_HAND &&
        PlayerHelper.isADefaultTrashCard(player, effectedCard)
      ) {
        decision.result = EffectType.TRASH_FROM_HAND;
        player.game.kingdom.trashCard(effectedCard);
        break;
      } else if (
        effect.effectType === EffectType.TOPDECK &&
        PlayerHelper.isADefaultTopdeckCard(player, effectedCard)
      ) {
        decision.result = EffectType.TOPDECK;
        player.topdeck(effectedCard);
        break;
      } else if (
        effect.effectType === EffectType.PASS &&
        i === effectMap.size - 1
      ) {
        decision.result = EffectType.PASS;
        break;
      } else {
        throw new Error(
          "Decision selectionMap not property configured. Maybe PASS is provided, but not as the final option?",
        );
      }
    }
  }

  static defaultSelector(player: Player): OrderedConditionGainSelector {
    const selector = new OrderedConditionGainSelector(player);
    selector.addGainAlwaysCondition(Province.NAME);
    selector.addGainAlwaysCondition(Gold.NAME);
    selector.addConditionSet(
      [
        new OrderedGainCondition(
          GainMetric.COINS_AVAILABLE,
          ThresholdType.GREATER_OR_EQUAL,
          5,
        ),
        new OrderedGainCondition(
          GainMetric.TURN,
          ThresholdType.GREATER_OR_EQUAL,
          12,
          LogicalJoiner.AND,
        ),
      ],
      Duchy.NAME,
    );
    selector.addCondition(
      new OrderedGainCondition(
        GainMetric.TURN,
        ThresholdType.GREATER_OR_EQUAL,
        19,
      ),
      Estate.NAME,
    );
    selector.addGainAlwaysCondition(Silver.NAME);
    selector.addConditionSet(
      [
        new OrderedGainCondition(
          GainMetric.COINS_AVAILABLE,
          ThresholdType.GREATER_OR_EQUAL,
          2,
        ),
        new OrderedGainCondition(
          GainMetric.TURN,
          ThresholdType.GREATER_OR_EQUAL,
          16,
          LogicalJoiner.AND,
        ),
      ],
      Estate.NAME,
    );

    return selector;
  }

  static defaultGainDecision(player: Player, amount: number): string {
    const selector = this.defaultSelector(player);

    return selector.getGainName(player, amount);
  }

  static countHandSize(player: Player): number {
    let handSize = 0;
    for (const card_stack of player.hand.values()) {
      handSize += card_stack.length;
    }
    return handSize;
  }

  static isADefaultTrashCard(player: Player, card: Card): boolean {
    if ([Copper.NAME, Curse.NAME].includes(card.name)) {
      return true;
    }
    if (card.name === Estate.NAME && player.game.turn < 10) {
      return true;
    }
    return false;
  }

  static isADefaultTopdeckCard(_player: Player, card: Card): boolean {
    if (card.types.includes(CardType.ACTION)) {
      return true;
    }
    return false;
  }
}
