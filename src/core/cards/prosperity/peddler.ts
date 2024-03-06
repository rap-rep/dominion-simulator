import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { ActionHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectAction, EffectPlayer } from "@src/core/effects";
import { InteractionType } from "@src/core/card_types";

const Name = "Peddler";

export class Peddler extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Peddler {
    return new Peddler();
  }

  heuristicType(): ActionHeuristicType {
    return ActionHeuristicType.CANTRIP;
  }

  playGraph(): Graph {
    const graph = new Graph();

    const draw = new PlayNode(
      new Effect(EffectAction.DRAW_CARD, EffectPlayer.SELF, 1),
    );
    const action = new PlayNode(
      new Effect(EffectAction.PLUS_ACTION, EffectPlayer.SELF, 1),
    );
    const coin = new PlayNode(
      new Effect(EffectAction.PLUS_COIN, EffectPlayer.SELF, 1),
    );

    graph.addNode(draw);
    graph.addNode(action);
    graph.addNode(coin);

    graph.addEdge(draw, action);
    graph.addEdge(action, coin);

    return graph;
  }

  specificReductionInteraction(): InteractionType | undefined {
    return InteractionType.ACTIONS_IN_PLAY_DURING_BUY;
  }

  cost(): number {
    return 8;
  }

  effectiveCost(
    globalReduction: number,
    specificReductionCount?: number | undefined,
  ): number {
    let specificReductionValue = 0;
    if (!specificReductionCount) {
      throw new Error(
        "Invalid state: effective cost for Peddler requires a value passed in representing actions in play",
      );
    } else {
      specificReductionValue = specificReductionCount * 2;
    }
    return Math.max(0, this.cost() - globalReduction - specificReductionValue);
  }
}
