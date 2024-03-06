import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { Effect, EffectAction, EffectPlayer } from "@src/core/effects";
import { ActionHeuristicType, CardType } from "@src/core/card_types";

const Name = "Copper";

export class Copper extends Card {
  constructor() {
    super(Name, [CardType.TREASURE]);
  }

  public static get NAME(): string {
    return Name;
  }

  heuristicType(): ActionHeuristicType {
    return ActionHeuristicType.TREASURE;
  }

  playGraph(): Graph {
    const graph = new Graph();
    graph.addNode(
      new PlayNode(new Effect(EffectAction.PLUS_COIN, EffectPlayer.SELF, 1)),
    );
    return graph;
  }
}
