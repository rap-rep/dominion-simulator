import { randomUUID } from "crypto";
import { Player } from "../player";
import {
  tokenizeExpression,
  parseExpression,
  evaluateExpression,
} from "expression-engine";
import { NullCard } from "../cards/basic/null_card";
import { MetricHelper } from "./metric_helpers";
import { DecisionType } from "../decisions";

export enum GainMetric {
  CAN_GAIN = "can gain",
  COINS_AVAILABLE = "coins available",
  TURN = "turn",
}

export enum LogicalJoiner {
  AND = "&&",
  OR = "||",
  NONE = "",
}

export enum ThresholdType {
  GREATER_OR_EQUAL = ">=",
  LESS_OR_EQUAL = "<=",
}

class EvalObject {
  [key: string]: any;
}

export enum Parentheses {
  OPEN = "(",
  CLOSED = ")",
  NONE = "",
}

export class OrderedGainCondition {
  metric: GainMetric;
  thresholdType: ThresholdType;
  threshold: number | undefined;
  id: string;
  threshold_id: string;
  logical_joiner: LogicalJoiner;
  open_paren: string;
  closed_paren: string;
  constructor(
    metric: GainMetric,
    thresholdType: ThresholdType,
    threshold: number | undefined,
    logical_joiner: LogicalJoiner = LogicalJoiner.NONE,
    open_parentheses: Parentheses = Parentheses.NONE,
    closed_parentheses: Parentheses = Parentheses.NONE,
  ) {
    this.logical_joiner = logical_joiner;
    this.metric = metric;
    this.thresholdType = thresholdType;
    this.threshold = threshold;
    this.id = "id_" + randomUUID().replace(/-/g, "");
    this.threshold_id = this.id + "_threshold";
    this.open_paren = open_parentheses;
    this.closed_paren = closed_parentheses;
  }

  getTokenizableEvaluation(): string {
    return `${this.open_paren} ${this.logical_joiner} ${this.id} ${this.thresholdType} ${this.threshold_id} ${this.closed_paren}`;
  }
}

type ConditionSet = {
  set: OrderedGainCondition[];
  card: string;
};

export class OrderedConditionGainSelector {
  conditionSets: ConditionSet[];
  player: Player;
  decisionType: DecisionType; // Informs what "amount" refers to
  amount: number; // The maximum cost that can be gained, or exact cost required to be gained
  constructor(player: Player, decisionType: DecisionType, amount: number) {
    if (decisionType === DecisionType.GAIN_CARD_EXACTLY) {
      throw new Error(`${DecisionType.GAIN_CARD_EXACTLY} Not yet implemented`);
    }

    this.conditionSets = [];
    this.player = player;
    this.decisionType = decisionType;
    this.amount = amount;
  }

  addGainAlwaysCondition(card: string) {
    this.conditionSets.push({
      set: [
        new OrderedGainCondition(
          GainMetric.CAN_GAIN,
          ThresholdType.GREATER_OR_EQUAL,
          MetricHelper.effectiveCostOf(this.player, card),
        ),
      ],
      card: card,
    });
  }

  addCondition(condition: OrderedGainCondition, card: string) {
    this.addConditionSet([condition], card);
  }

  addConditionSet(conditionSet: OrderedGainCondition[], card: string) {
    if (conditionSet.length < 1) {
      throw new Error("No conditions in conditionSet");
    } else if (conditionSet[0].logical_joiner !== LogicalJoiner.NONE) {
      throw new Error(
        `First element in condition set can not have a logical joiner, but one was provided ${conditionSet}`,
      );
    }
    // Ensure every condition contains at least the ablity to gain the card
    conditionSet.push(
      new OrderedGainCondition(
        GainMetric.CAN_GAIN,
        ThresholdType.GREATER_OR_EQUAL,
        MetricHelper.effectiveCostOf(this.player, card),
        LogicalJoiner.AND,
      ),
    );
    this.conditionSets.push({ set: conditionSet, card: card });
  }

  private getMetricValue(player: Player, metric: GainMetric): number {
    if (metric === GainMetric.COINS_AVAILABLE) {
      return player.coins;
    } else if (metric === GainMetric.CAN_GAIN) {
      return this.amount;
    } else if (metric === GainMetric.TURN) {
      return player.game.turn;
    } else {
      throw new Error(`Metric ${metric} not implemented`);
    }
  }

  getGainName(player: Player): string {
    for (const conditionSet of this.conditionSets) {
      let condition_token_str = "";
      const evalObj = new EvalObject();
      for (const condition of conditionSet.set) {
        const metricValue = this.getMetricValue(player, condition.metric);
        const condition_token_part = condition.getTokenizableEvaluation();
        condition_token_str += condition_token_part;

        evalObj[condition.id] = metricValue;
        evalObj[condition.threshold_id] = condition.threshold;
      }
      const ast = parseExpression(tokenizeExpression(condition_token_str));

      const result = evaluateExpression(ast, evalObj) as boolean;
      if (result == true) {
        return conditionSet.card;
      }
    }
    return NullCard.NAME;
  }
}
