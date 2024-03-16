import { Graph, PlayNode } from "@src/core/graph";
import { CardHeuristicType, CardType } from "@src/core/card_types";
import { Card } from "../../card";
import { Effect, EffectAction, EffectPlayer } from "@src/core/effects";

const Name = "Gold";

export class Gold extends Card {
  constructor() {
    super(Name, [CardType.TREASURE]);
  }

  public static get NAME(): string {
    return Name;
  }

  heuristicType(): CardHeuristicType {
    return CardHeuristicType.TREASURE;
  }

  playGraph(): Graph {
    const graph = new Graph();

    graph.addNode(
      new PlayNode(
        new Effect(
          EffectAction.PLUS_COIN,
          EffectPlayer.SELF,
          3,
          undefined,
          this,
        ),
      ),
    );

    return graph;
  }

  cost(): number {
    return 6;
  }
}
