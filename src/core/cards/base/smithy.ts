import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { CardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";

const Name = "Smithy";

export class Smithy extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Smithy {
    return new Smithy();
  }

  heuristicType(): CardHeuristicType {
    return CardHeuristicType.TERMINAL_DRAW;
  }

  playGraph(): Graph {
    const graph = new Graph();
    const draw = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 3, undefined, this),
    );
    graph.addNode(draw);
    return graph;
  }

  cost(): number {
    return 4;
  }
}
