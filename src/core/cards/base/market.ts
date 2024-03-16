import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { CardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectAction, EffectPlayer } from "@src/core/effects";

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

  heuristicType(): CardHeuristicType {
    return CardHeuristicType.CANTRIP;
  }

  playGraph(): Graph {
    const graph = new Graph();

    const draw = new PlayNode(
      new Effect(EffectAction.DRAW_CARD, EffectPlayer.SELF, 1, undefined, this),
    );
    const action = new PlayNode(
      new Effect(
        EffectAction.PLUS_ACTION,
        EffectPlayer.SELF,
        1,
        undefined,
        this,
      ),
    );
    const coin = new PlayNode(
      new Effect(EffectAction.PLUS_COIN, EffectPlayer.SELF, 1, undefined, this),
    );
    const buy = new PlayNode(
      new Effect(EffectAction.PLUS_BUY, EffectPlayer.SELF, 1, undefined, this),
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
}
