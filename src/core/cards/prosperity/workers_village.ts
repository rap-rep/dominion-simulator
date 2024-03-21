import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { CardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";

const Name = "Worker's Village";

export class WorkersVillage extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  heuristicType(): CardHeuristicType {
    return CardHeuristicType.VILLAGE;
  }

  static factoryGenerator(): WorkersVillage {
    return new WorkersVillage();
  }

  playGraph(): Graph {
    const graph = new Graph();

    const draw = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 1, undefined, this),
    );
    const action = new PlayNode(
      new Effect(EffectType.PLUS_ACTION, EffectPlayer.SELF, 2, undefined, this),
    );
    const buy = new PlayNode(
      new Effect(EffectType.PLUS_BUY, EffectPlayer.SELF, 1, undefined, this),
    );

    graph.addNode(draw);
    graph.addNode(action);
    graph.addNode(buy);
    graph.addEdge(draw, action);
    graph.addEdge(action, buy);
    return graph;
  }

  cost(): number {
    return 4;
  }
}
