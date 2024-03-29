import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { CardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";

const Name = "Village";

export class Village extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  heuristicType(): CardHeuristicType {
    return CardHeuristicType.VILLAGE;
  }

  static factoryGenerator(): Village {
    return new Village();
  }

  playGraph(): Graph {
    const graph = new Graph();

    const draw = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 1, undefined, this),
    );
    const action = new PlayNode(
      new Effect(EffectType.PLUS_ACTION, EffectPlayer.SELF, 2, undefined, this),
    );

    graph.addNode(draw);
    graph.addNode(action);
    graph.addEdge(draw, action);

    return graph;
  }

  cost(): number {
    return 3;
  }
}
