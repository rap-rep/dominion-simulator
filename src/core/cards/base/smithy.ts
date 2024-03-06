import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { ActionHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectAction, EffectPlayer } from "@src/core/effects";

const Name = "Smithy";

export class Smithy extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  heuristicType(): ActionHeuristicType {
    return ActionHeuristicType.TERMINAL_DRAW;
  }

  playGraph(): Graph {
    const graph = new Graph();
    const draw = new PlayNode(
      new Effect(EffectAction.DRAW_CARD, EffectPlayer.SELF, 3),
    );
    graph.addNode(draw);
    return graph;
  }

  cost(): number {
    return 4;
  }
}
