import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";

const Name = "Village";

export class Village extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.VILLAGE;
  }

  static factoryGenerator(): Village {
    return new Village();
  }

  playGraph(): Graph {
    const graph = new Graph();

    const draw = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 1, undefined, this),
    );
    const action = new PlayNode(
      new Effect(EffectType.PLUS_ACTION, EffectPlayer.SELF, 2, undefined, this),
    );

    graph.addNode(draw);
    graph.addNode(action);
    graph.addEdge(draw, action);

    return graph;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.VILLAGE;
  }

  terminalType(): TerminalType {
    return TerminalType.NONTERMINAL;
  }

  cost(): number {
    return 3;
  }
}
