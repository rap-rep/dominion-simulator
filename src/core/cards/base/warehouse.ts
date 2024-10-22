import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { CardType, DeprecatedCardHeuristicType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";
import { Player } from "@src/core/player";

const Name = "Warehouse";

export class Warehouse extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Warehouse {
    return new Warehouse();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.NONTERMINAL_HAND_SIFTER;
  }

  playGraph(): Graph {
    const graph = new Graph();
    const cards = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 3, undefined, this),
    );
    const action = new PlayNode(
      new Effect(EffectType.PLUS_ACTION, EffectPlayer.SELF, 1, undefined, this),
    );
    const discardDecision = new Decision(
      DecisionType.DISCARD,
      EffectPlayer.SELF,
      3,
      this,
    );
    const discard = new PlayNode(discardDecision);
    const discardApply = new PlayNode(
      new Effect(
        EffectType.DISCARD_FROM_HAND,
        EffectPlayer.SELF,
        undefined,
        discardDecision,
        this,
      ),
    );
    graph.addNode(cards);
    graph.addNode(action);
    graph.addNode(discard);
    graph.addNode(discardApply);

    graph.addEdge(cards, action);
    graph.addEdge(action, discard);
    graph.addEdge(discard, discardApply);
    return graph;
  }

  cost(): number {
    return 3;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.FROM_HAND_SIFTER;
  }

  terminalType(): TerminalType {
    return TerminalType.NONTERMINAL;
  }

  drawHeuristicValue(_player: Player): number {
    return 3;
  }
}
