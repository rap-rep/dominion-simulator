import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";

const Name = "Moneylender";

export class Moneylender extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Moneylender {
    return new Moneylender();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TRASHER;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.TRASHER;
  }

  terminalType(): TerminalType {
    return TerminalType.TERMINAL;
  }

  playGraph(): Graph {
    const graph = new Graph();

    const trashCopperDecision = new Decision(
      DecisionType.TRASH_COPPER,
      EffectPlayer.SELF,
      1,
      this,
    );

    const trashCopperDecisionNode = new PlayNode(trashCopperDecision);

    const trashCopperEffect = new Effect(
      EffectType.TRASH_FROM_HAND,
      EffectPlayer.SELF,
      trashCopperDecision.result as Card[],
      trashCopperDecision,
      this,
    );

    const trashCopper = new PlayNode(trashCopperEffect);

    const plusCoins = new PlayNode(
      new Effect(
        EffectType.PLUS_COIN_CONDITIONAL,
        EffectPlayer.SELF,
        3,
        trashCopperEffect,
        this,
      ),
    );

    graph.addNode(trashCopperDecisionNode);
    graph.addNode(trashCopper);
    graph.addNode(plusCoins);
    graph.addEdge(trashCopperDecisionNode, trashCopper);
    graph.addEdge(trashCopper, plusCoins);
    return graph;
  }

  cost(): number {
    return 4;
  }
}
