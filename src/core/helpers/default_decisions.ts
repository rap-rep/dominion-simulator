import { Card } from "../card";
import { ActionHeuristicType, CardType } from "../card_types";
import { Gear } from "../cards/adventures/gear";
import { Copper } from "../cards/basic/copper";
import { Curse } from "../cards/basic/curse";
import { Duchy } from "../cards/basic/duchy";
import { Estate } from "../cards/basic/estate";
import { Gold } from "../cards/basic/gold";
import { NullCard } from "../cards/basic/null_card";
import { Province } from "../cards/basic/province";
import { Silver } from "../cards/basic/silver";
import { Decision, DecisionType } from "../decisions";
import { EffectAction } from "../effects";
import {
  GainMetric,
  LogicalJoiner,
  OrderedConditionGainSelector,
  OrderedGainCondition,
  ThresholdType,
} from "../logic/ordered_condition_gaining";
import { Player } from "../player";

const NULL_CARD = new NullCard();

export class PlayerHelper {
  static makeDefaultDecision(player: Player, decision: Decision) {
    if (decision.decisionType === DecisionType.SELECT_EFFECT) {
      PlayerHelper.watchtowerDecision(player, decision);
    } else if (decision.decisionType === DecisionType.GAIN_CARD_UP_TO) {
      player.gainCardDecision(decision);
    } else if (decision.decisionType === DecisionType.SET_ASIDE_ON_FROM_HAND) {
      if (decision.fromCard.name === Gear.NAME) {
        Gear.defaultGearDecision(player, decision);
      } else {
        throw new Error(
          `Set aside decision for ${decision.decisionType}, ${decision.nodeType}, ${decision.amount}, ${decision.result}, card ${decision.fromCard.name} not implemented`,
        );
      }
    } else {
      throw new Error(
        `Default decision for ${decision.decisionType} not implemented`,
      );
    }
  }

  static selectAnyAction(player: Player): Card {
    for (const card_stack of player.hand.values()) {
      if (card_stack[0].types.includes(CardType.ACTION)) {
        return card_stack[0];
      }
    }
    return NULL_CARD;
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
    heuristicType: ActionHeuristicType,
    alreadySelectedCard?: Card | undefined, // TODO make more resilient (really just for Gear right now and thus only works for one card)
  ): Card | undefined {
    for (const cardStack of player.hand.values()) {
      if (cardStack[0].heuristicType() === heuristicType) {
        // if the card has already been selected, prevent re-selection of the same card
        if (alreadySelectedCard?.name === cardStack[0].name) {
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
        effect.action === EffectAction.TRASH &&
        PlayerHelper.isADefaultTrashCard(player, effectedCard)
      ) {
        decision.result = EffectAction.TRASH;
        player.game.kingdom.trashCard(effectedCard);
        break;
      } else if (
        effect.action === EffectAction.TOPDECK &&
        PlayerHelper.isADefaultTopdeckCard(player, effectedCard)
      ) {
        decision.result = EffectAction.TOPDECK;
        player.topdeck(effectedCard);
        break;
      } else if (
        effect.action === EffectAction.PASS &&
        i === effectMap.size - 1
      ) {
        decision.result = EffectAction.PASS;
        break;
      } else {
        throw new Error(
          "Decision selectionMap not property configured. Maybe PASS is provided, but not as the final option?",
        );
      }
    }
  }

  static defaultGainDecision(
    player: Player,
    decisionType: DecisionType,
    amount: number,
  ): string {
    const selector = new OrderedConditionGainSelector(
      player,
      decisionType,
      amount,
    );
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

    return selector.getGainName(player);
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
