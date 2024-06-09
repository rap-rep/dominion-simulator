import { Graph, PlayNode } from "@src/core/graph";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Card } from "../../card";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";

const Name = "Gold";

export class Gold extends Card {
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
        new Effect(EffectType.PLUS_COIN, EffectPlayer.SELF, 3, undefined, this),
      ),
    );

    return graph;
  }

  cost(): number {
    return 6;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.TREASURE;
  }

  terminalType(): TerminalType {
    return TerminalType.NONTERMINAL;
  }

  economyHeuristicValue(): number {
    return 3;
  }
}
