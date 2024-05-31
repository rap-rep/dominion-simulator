import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { CardType, DeprecatedCardHeuristicType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { HeuristicType, TerminalType } from "@src/core/logic/card_selector";
import { Decision, DecisionType } from "@src/core/decisions";

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
    // TODO
    const graph = new Graph();
    /*
    const cards = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 3, undefined, this),
    );
    const action = new PlayNode(
        new Effect(EffectType.PLUS_ACTION, EffectPlayer.SELF, 1, undefined, this),
    );
    const discardDecision = new Decision(DecisionType.DISCARD_TO, EffectPlayer.SELF, 3, this);
    const discard = new PlayNode(discardDecision);
    const discardApply = new PlayNode(
        new Effect(EffectType.DISCARD_FROM_HAND, EffectPlayer.OPP, undefined, discardDecision, this),
    );
    graph.addNode(coin);
    graph.addNode(oppDiscard);
    graph.addNode(oppDiscardApply);

    graph.addEdge(coin, oppDiscard);
    graph.addEdge(oppDiscard, oppDiscardApply);
    */
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
}
