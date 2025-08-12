import { Village } from "../cards/base/village";
import { Duchy } from "../cards/basic/duchy";
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

export class SimpleEngineSamplePlayer extends Player {
  /*
   * Extremely basic player that plays only Wharf/Village using gain rules
   * Not intended to be used for anything serious.
   */
  gainCardDecision(decision: Decision): string {
    if (decision.decisionType === DecisionType.BUY_CARD) {
      const toGain = SimpleEngineSamplePlayer.defaultGainDecision(this, this.coins);
      this.game.gamelog.logBuy(this, toGain);
      return toGain;
    } else if (decision.decisionType == DecisionType.GAIN_CARD_UP_TO) {
      if (!decision.amount) {
        throw new Error(
          "Decision amount required but not provided for gain effect",
        );
      }
      const decisionResult = SimpleEngineSamplePlayer.defaultGainDecision(
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
    selector.addCondition(
      new OrderedGainCondition(
        GainMetric.CARD_IN_DECK_COUNT,
        ThresholdType.GREATER_OR_EQUAL,
        3,
        undefined,
        undefined,
        undefined,
        [Province.NAME],
      ),
      Duchy.NAME,
    );
    selector.addCondition(
      new OrderedGainCondition(
        GainMetric.CARD_IN_DECK_COUNT,
        ThresholdType.GREATER_OR_EQUAL,
        3,
        undefined,
        undefined,
        undefined,
        [Wharf.NAME, Village.NAME],
      ),
      Village.NAME,
    );
    selector.addGainAlwaysCondition(Wharf.NAME);
    selector.addCondition(
      new OrderedGainCondition(
        GainMetric.CARD_IN_DECK_COUNT,
        ThresholdType.GREATER_OR_EQUAL,
        1,
        undefined,
        undefined,
        undefined,
        [Wharf.NAME, Village.NAME],
      ),
      Village.NAME,
    );
    selector.addCondition(
      new OrderedGainCondition(GainMetric.TURN, ThresholdType.LESS_OR_EQUAL, 2),
      Silver.NAME,
    );
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
