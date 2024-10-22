import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { InteractionType } from "@src/core/card_types";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";
import { Player } from "@src/core/player";

const Name = "Peddler";

export class Peddler extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Peddler {
    return new Peddler();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.CANTRIP;
  }

  playGraph(): Graph {
    const graph = new Graph();

    const draw = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 1, undefined, this),
    );
    const action = new PlayNode(
      new Effect(EffectType.PLUS_ACTION, EffectPlayer.SELF, 1, undefined, this),
    );
    const coin = new PlayNode(
      new Effect(EffectType.PLUS_COIN, EffectPlayer.SELF, 1, undefined, this),
    );

    graph.addNode(draw);
    graph.addNode(action);
    graph.addNode(coin);

    graph.addEdge(draw, action);
    graph.addEdge(action, coin);

    return graph;
  }

  specificReductionInteraction(): InteractionType | undefined {
    return InteractionType.ACTIONS_IN_PLAY_DURING_BUY;
  }

  cost(): number {
    return 8;
  }

  effectiveCost(
    globalReduction: number,
    specificReductionCount?: number | undefined,
  ): number {
    let specificReductionValue = 0;
    if (specificReductionCount === undefined) {
      throw new Error(
        "Invalid state: effective cost for Peddler requires a value passed in representing actions in play",
      );
    } else {
      specificReductionValue = specificReductionCount * 2;
    }
    return Math.max(0, this.cost() - globalReduction - specificReductionValue);
  }

  economyHeuristicValue(): number {
    return 1;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.CANTRIP;
  }

  terminalType(): TerminalType {
    return TerminalType.NONTERMINAL;
  }

  drawHeuristicValue(_player: Player): number {
    return 1;
  }
}
