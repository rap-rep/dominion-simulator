import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { CardType, DeprecatedCardHeuristicType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { HeuristicType, TerminalType } from "@src/core/logic/card_selector";
import { Decision, DecisionType } from "@src/core/decisions";

const Name = "Milita";

export class Milita extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Milita {
    return new Milita();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TERMINAL_PAYLOAD;
  }

  playGraph(): Graph {
    const graph = new Graph();

    const coin = new PlayNode(
      new Effect(EffectType.PLUS_COIN, EffectPlayer.SELF, 2, undefined, this),
    );
    const discardDecision = new Decision(
      DecisionType.DISCARD_TO,
      EffectPlayer.OPP,
      3,
      this,
    );
    const oppDiscard = new PlayNode(discardDecision);
    const oppDiscardApply = new PlayNode(
      new Effect(
        EffectType.DISCARD_FROM_HAND,
        EffectPlayer.OPP,
        undefined,
        discardDecision,
        this,
      ),
    );

    graph.addNode(coin);
    graph.addNode(oppDiscard);
    graph.addNode(oppDiscardApply);

    graph.addEdge(coin, oppDiscard);
    graph.addEdge(oppDiscard, oppDiscardApply);
    return graph;
  }

  cost(): number {
    return 4;
  }

  economyHeuristicValue(): number {
    return 2;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.PAYLOAD_COINS;
  }

  terminalType(): TerminalType {
    return TerminalType.TERMINAL;
  }
}
