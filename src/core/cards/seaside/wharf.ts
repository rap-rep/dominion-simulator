import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import {
  ActionHeuristicType,
  CardType,
  DurationPhase,
} from "@src/core/card_types";
import { Effect, EffectAction, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";

const Name = "Wharf";

export class Wharf extends Card {
  durationPhase: DurationPhase | undefined;
  constructor() {
    super(Name, [CardType.ACTION, CardType.DURATION]);

    this.setAsideDecision = new Decision(
      DecisionType.SET_ASIDE_ON_FROM_HAND,
      EffectPlayer.SELF,
      2,
    );

    this.durationPhase = DurationPhase.REMAINS_IN_PLAY;
  }

  public static get NAME(): string {
    return Name;
  }

  heuristicType(): ActionHeuristicType {
    return ActionHeuristicType.TERMINAL_DRAW;
  }

  staysInPlay(): boolean {
    if (this.durationPhase === DurationPhase.REMAINS_IN_PLAY) {
      return true;
    } else {
      return false;
    }
  }

  playGraph(): Graph {
    const graph = new Graph();
    const draw = new PlayNode(
      new Effect(EffectAction.DRAW_CARD, EffectPlayer.SELF, 2),
    );
    const buy = new PlayNode(
      new Effect(EffectAction.PLUS_BUY, EffectPlayer.SELF, 1),
    );

    graph.addNode(draw);
    graph.addNode(buy);
    graph.addEdge(draw, buy);
    return graph;
  }

  durationPlayGraph(): Graph {
    const graph = new Graph();
    const draw = new PlayNode(
      new Effect(EffectAction.DRAW_CARD, EffectPlayer.SELF, 2),
    );
    const buy = new PlayNode(
      new Effect(EffectAction.PLUS_BUY, EffectPlayer.SELF, 1),
    );
    graph.addNode(draw);
    graph.addNode(buy);
    graph.addEdge(draw, buy);

    return graph;
  }

  cost(): number {
    return 3;
  }
}
