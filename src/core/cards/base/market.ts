import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";
import { Player } from "@src/core/player";

const Name = "Market";

export class Market extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Market {
    return new Market();
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
    const buy = new PlayNode(
      new Effect(EffectType.PLUS_BUY, EffectPlayer.SELF, 1, undefined, this),
    );

    graph.addNode(draw);
    graph.addNode(action);
    graph.addNode(coin);
    graph.addNode(buy);

    graph.addEdge(draw, action);
    graph.addEdge(action, coin);
    graph.addEdge(coin, buy);

    return graph;
  }

  cost(): number {
    return 5;
  }

  economyHeuristicValue(): number {
    return 1;
  }

  drawHeuristicValue(_player: Player): number {
    return 1;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.CANTRIP;
  }

  terminalType(): TerminalType {
    return TerminalType.NONTERMINAL;
  }
}
