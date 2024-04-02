import { randomUUID } from "crypto";
import { Player } from "../player";
import {
  tokenizeExpression,
  parseExpression,
  evaluateExpression,
} from "expression-engine";
import { NullCard } from "../cards/basic/null_card";
import { MetricHelper } from "./metric_helpers";
import { PlayerHelper } from "../helpers/player_helper";
import { LogLevel, LogMode } from "../logging/game_log";

// JSON import type
export type ConditionSetList = {
  conditionSetList: [
    {
      conditionSet: [
        {
          gainMetric: string;
          amount?: number | undefined;
          cardList?: string[] | undefined;
          joiner?: string | undefined;
          comparator?: string | undefined;
        },
      ];
      cardToGain: string;
    },
  ];
};

export enum GainMetric {
  CAN_GAIN = "can gain",
  COINS_AVAILABLE = "coins available",
  TURN = "turn",
  CARD_IN_DECK_COUNT = "# cards in deck",
}

// The frontend uses slightly different names and sometimes structure
// Needed here for translation reference from frontend
// TODO maybe make these schemas match
export enum GainMetricFrontend {
  CAN_GAIN = "can_gain",
  COINS_AVAILABLE = "coins_available",
  TURN = "turn",
  CARD_IN_DECK_COUNT = "in_deck",
  DIFF_IN_DECK = "diff_in_deck",
}

export enum LogicalJoiner {
  AND = "&&",
  OR = "||",
  NONE = "",
}

export enum LogicalJoinerFrontend {
  AND = "AND",
  OR = "OR",
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
}

export class OrderedGainCondition {
  metric: GainMetric;
  thresholdType: ThresholdType;
  threshold: number | undefined;
  id: string;
  threshold_id: string;
  logical_joiner: LogicalJoiner;
  start_parens: string;
  end_parens: string;
  card_references: string[] | undefined;
  constructor(
    metric: GainMetric,
    thresholdType: ThresholdType,
    threshold: number | undefined,
    logical_joiner: LogicalJoiner = LogicalJoiner.NONE,
    start_parens: Parentheses[] | Parentheses = [],
    end_parens: Parentheses[] | Parentheses = [],
    card_references: string[] | undefined = undefined,
  ) {
    this.logical_joiner = logical_joiner;
    this.metric = metric;
    this.thresholdType = thresholdType;
    this.threshold = threshold;
    this.id = "id_" + randomUUID().replace(/-/g, "");
    this.threshold_id = this.id + "_threshold";
    if (!Array.isArray(start_parens)) {
      start_parens = [start_parens];
    }
    if (!Array.isArray(end_parens)) {
      end_parens = [end_parens];
    }
    this.start_parens = start_parens.join(" ");
    this.end_parens = end_parens.join(" ");
    this.card_references = card_references;
  }

  getTokenizableEvaluation(): string {
    return `${this.start_parens} ${this.logical_joiner} ${this.id} ${this.thresholdType} ${this.threshold_id} ${this.end_parens}`;
  }
}

type ConditionSet = {
  set: OrderedGainCondition[];
  card: string;
};

export class OrderedConditionGainSelector {
  conditionSets: ConditionSet[];
  player: Player;
  constructor(player: Player) {
    this.conditionSets = [];
    this.player = player;
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
        `First element in condition set can not have a logical joiner, but one was provided for ${conditionSet[0].metric} for ${card}: ${conditionSet[0].logical_joiner}`,
      );
    }

    // Ensure every condition contains at least the ablity to gain the card
    // Group all already provided conditions to ensure this check is applied separately
    conditionSet[0].start_parens = "(" + conditionSet[0].start_parens;
    conditionSet[conditionSet.length - 1].end_parens =
      conditionSet[conditionSet.length - 1].end_parens + ")";
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

  private getMetricValue(
    player: Player,
    metric: GainMetric,
    amount: number,
    cardReferences?: string[],
  ): number {
    if (metric === GainMetric.COINS_AVAILABLE) {
      return player.coins;
    } else if (metric === GainMetric.CAN_GAIN) {
      return amount;
    } else if (metric === GainMetric.TURN) {
      return player.game.turn;
    } else if (metric === GainMetric.CARD_IN_DECK_COUNT) {
      if (
        !cardReferences ||
        cardReferences.length < 1 ||
        cardReferences.length > 2
      ) {
        throw new Error(
          `Expected to find 1 or 2 card references, but ${cardReferences?.length} provided: '${cardReferences?.join(",")}'`,
        );
      }
      if (cardReferences.length === 1) {
        return PlayerHelper.countOfCardInDeck(player, cardReferences[0]);
      } else {
        return PlayerHelper.diffOfCardsInDeck(
          player,
          cardReferences[0],
          cardReferences[1],
        );
      }
    } else {
      throw new Error(`Metric ${metric} not implemented`);
    }
  }

  getGainName(player: Player, amount: number): string {
    for (const conditionSet of this.conditionSets) {
      let condition_token_str = "";
      const evalObj = new EvalObject();
      for (const condition of conditionSet.set) {
        const metricValue = this.getMetricValue(
          player,
          condition.metric,
          amount,
          condition.card_references,
        );
        if (condition.metric === GainMetric.CAN_GAIN) {
          // Update threshold value to current card cost
          condition.threshold = MetricHelper.effectiveCostOf(
            player,
            conditionSet.card,
          );
        }
        const condition_token_part = condition.getTokenizableEvaluation();
        condition_token_str += condition_token_part;

        evalObj[condition.id] = metricValue;
        evalObj[condition.threshold_id] = condition.threshold;
      }

      player.game.gamelog.log(condition_token_str, LogLevel.EXTREME);
      if (
        player.game.gamelog.level === LogLevel.DEBUG &&
        player.game.gamelog.mode === LogMode.CONSOLE_LOG
      ) {
        // TODO fix this and send it with LogLevel.EXTREME
        // temporary hack until able to properly convert to string for actual log
        // console.log(evalObj); //needs to stay commented unless debugging
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
