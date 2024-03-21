import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { CardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";

const Name = "Silver";

export class Silver extends Card {
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
        new Effect(EffectType.PLUS_COIN, EffectPlayer.SELF, 2, undefined, this),
      ),
    );

    return graph;
  }

  cost(): number {
    return 3;
  }
}
