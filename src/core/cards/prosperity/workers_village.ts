import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { ActionHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectAction, EffectPlayer } from "@src/core/effects";

const Name = "Worker's Village";

export class WorkersVillage extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  heuristicType(): ActionHeuristicType {
    return ActionHeuristicType.VILLAGE;
  }

  static factoryGenerator(): WorkersVillage {
    return new WorkersVillage();
  }

  playGraph(): Graph {
    const graph = new Graph();

    const draw = new PlayNode(
      new Effect(EffectAction.DRAW_CARD, EffectPlayer.SELF, 1),
    );
    const action = new PlayNode(
      new Effect(EffectAction.PLUS_ACTION, EffectPlayer.SELF, 2),
    );
    const buy = new PlayNode(
      new Effect(EffectAction.PLUS_BUY, EffectPlayer.SELF, 1),
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
