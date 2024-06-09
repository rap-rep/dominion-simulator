import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";

const Name = "Workshop";

export class Workshop extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TERMINAL_GAINER;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.PAYLOAD_GAINER;
  }

  terminalType(): TerminalType {
    return TerminalType.TERMINAL;
  }

  playGraph(): Graph {
    const graph = new Graph();
    const gainCardDecision = new Decision(
      DecisionType.GAIN_CARD_UP_TO,
      EffectPlayer.SELF,
      4,
      this,
    );
    const decisionNode = new PlayNode(gainCardDecision);
    graph.addNode(decisionNode);
    const gainNode = new PlayNode(
      new Effect(
        EffectType.GAIN_FROM_SUPPLY,
        EffectPlayer.SELF,
        undefined,
        gainCardDecision,
        this,
      ),
    );
    graph.addNode(gainNode);
    graph.addEdge(decisionNode, gainNode);
    return graph;
  }

  cost(): number {
    return 3;
  }
}
