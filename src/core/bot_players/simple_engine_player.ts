import { Market } from "../cards/base/market";
import { Village } from "../cards/base/village";
import { Duchy } from "../cards/basic/duchy";
import { Gold } from "../cards/basic/gold";
import { Province } from "../cards/basic/province";
import { Silver } from "../cards/basic/silver";
import { Wharf } from "../cards/seaside/wharf";
import { Decision, DecisionType } from "../decisions";
import { PlayerHelper } from "../helpers/default_decisions";
import {
  GainMetric,
  OrderedConditionGainSelector,
  OrderedGainCondition,
  ThresholdType,
} from "../logic/ordered_condition_gaining";
import { Player } from "../player";

export class SimpleEnginePlayer extends Player {
  gainCardDecision(decision: Decision): string {
    if (decision.decisionType == DecisionType.BUY_CARD) {
      return PlayerHelper.defaultGainDecision(
        this,
        decision.decisionType,
        this.coins,
      );
    } else if (decision.decisionType == DecisionType.GAIN_CARD_UP_TO) {
      if (!decision.amount) {
        throw new Error(
          "Decision amount required but not provided for gain effect",
        );
      }
      const decisionResult = PlayerHelper.defaultGainDecision(
        this,
        decision.decisionType,
        decision.amount,
      );
      decision.result = decisionResult;
      return decisionResult;
    } else {
      throw new Error(`Unsupported gain type: ${decision.decisionType}`);
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

    selector.addConditionSet(
      [
        new OrderedGainCondition(
          GainMetric.TURN,
          ThresholdType.LESS_OR_EQUAL,
          10,
        ),
        new OrderedGainCondition(
          GainMetric.TURN,
          ThresholdType.GREATER_OR_EQUAL,
          7,
        ),
      ],
      Gold.NAME,
    );
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
        GainMetric.TURN,
        ThresholdType.GREATER_OR_EQUAL,
        18,
      ),
      Duchy.NAME,
    );
    selector.addGainAlwaysCondition(Wharf.NAME);
    selector.addCondition(
      new OrderedGainCondition(GainMetric.TURN, ThresholdType.LESS_OR_EQUAL, 4),
      Silver.NAME,
    );
    selector.addGainAlwaysCondition(Village.NAME);

    return selector.getGainName(player);
  }
}
