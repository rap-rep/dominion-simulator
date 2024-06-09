import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";

const Name = "Copper";

export class Copper extends Card {
  constructor() {
    super(Name, [CardType.TREASURE]);
  }

  public static get NAME(): string {
    return Name;
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TREASURE;
  }

  playGraph(): Graph {
    const graph = new Graph();
    graph.addNode(
      new PlayNode(
        new Effect(EffectType.PLUS_COIN, EffectPlayer.SELF, 1, undefined, this),
      ),
    );
    return graph;
  }

  economyHeuristicValue(): number {
    return 1;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.TREASURE;
  }

  terminalType(): TerminalType {
    return TerminalType.NONTERMINAL;
  }
}
