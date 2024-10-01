import { Village } from "../cards/base/village";
import { Duchy } from "../cards/basic/duchy";
import { Gold } from "../cards/basic/gold";
import { Province } from "../cards/basic/province";
import { Silver } from "../cards/basic/silver";
import { Wharf } from "../cards/seaside/wharf";
import { Decision, DecisionType } from "../decisions";
import {
  ConditionSetList,
  GainMetric,
  OrderedConditionGainSelector,
  OrderedGainCondition,
  ThresholdType,
} from "../logic/ordered_condition_gaining";
import { Player } from "../player";

export class StandardEnginePlayer extends Player {
  analyzeKingdom() {
    // trashing
    // draw
    // actions
    // payload
  }

  /*
   * Core engine bot player
   */
  gainCardDecision(decision: Decision): string {
    if (decision.decisionType === DecisionType.BUY_CARD) {
      const toGain = StandardEnginePlayer.defaultGainDecision(this, this.coins);
      this.game.gamelog.logBuy(this, toGain);
      return toGain;
    } else if (decision.decisionType == DecisionType.GAIN_CARD_UP_TO) {
      if (!decision.amount) {
        throw new Error(
          "Decision amount required but not provided for gain effect",
        );
      }
      const decisionResult = StandardEnginePlayer.defaultGainDecision(
        this,
        decision.amount,
      );
      decision.result = decisionResult;
      return decisionResult;
    } else {
      throw new Error(`Unsupported gain type: ${decision.decisionType}`);
    }
  }

  loadSelectorFromConditionSet(
    _conditionSetList?: ConditionSetList,
  ): OrderedConditionGainSelector {
    const selector = new OrderedConditionGainSelector(this);

    selector.addCondition(
      new OrderedGainCondition(
        GainMetric.TURN,
        ThresholdType.GREATER_OR_EQUAL,
        10,
      ),
      Province.NAME,
    );
    selector.addGainAlwaysCondition(Gold.NAME);
    selector.addGainAlwaysCondition(Silver.NAME);
    return selector;
  }

  static defaultGainDecision(player: Player, amount: number): string {
    if (!player.selector) {
      player.selector = player.loadSelectorFromConditionSet();
    }

    return player.selector.getGainName(player, amount);
  }
}
