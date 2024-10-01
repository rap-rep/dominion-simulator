import { Graph, PlayNode } from "@src/core/graph";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Card } from "../../card";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";

const Name = "Stockpile";

export class Stockpile extends Card {
  constructor() {
    super(Name, [CardType.TREASURE]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Stockpile {
    return new Stockpile();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TREASURE;
  }

  playGraph(): Graph {
    const graph = new Graph();

    const coins = new PlayNode(
      new Effect(EffectType.PLUS_COIN, EffectPlayer.SELF, 3, undefined, this),
    );

    const buy = new PlayNode(
      new Effect(EffectType.PLUS_BUY, EffectPlayer.SELF, 1, undefined, this),
    );

    const exileSelf = new PlayNode(
      new Effect(EffectType.EXILE_FROM_PLAY, EffectPlayer.SELF, undefined, undefined, this),
    );

    graph.addNode(coins);
    graph.addNode(buy);
    graph.addNode(exileSelf);
    graph.addEdge(coins, buy);
    graph.addEdge(buy, exileSelf);

    return graph;
  }

  cost(): number {
    return 3;
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
