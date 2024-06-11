import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import {
  DeprecatedCardHeuristicType,
  CardType,
  DurationPhase,
} from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";

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

  static factoryGenerator(): Wharf {
    return new Wharf();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TERMINAL_DRAW;
  }

  playGraph(): Graph {
    const graph = new Graph();
    const draw = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 2, undefined, this),
    );
    const buy = new PlayNode(
      new Effect(EffectType.PLUS_BUY, EffectPlayer.SELF, 1, undefined, this),
    );

    graph.addNode(draw);
    graph.addNode(buy);
    graph.addEdge(draw, buy);
    return graph;
  }

  durationPlayGraph(): Graph {
    const graph = new Graph();
    const draw = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 2, undefined, this),
    );
    const buy = new PlayNode(
      new Effect(EffectType.PLUS_BUY, EffectPlayer.SELF, 1, undefined, this),
    );
    graph.addNode(draw);
    graph.addNode(buy);
    graph.addEdge(draw, buy);

    return graph;
  }

  cost(): number {
    return 5;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.DRAW;
  }

  terminalType(): TerminalType {
    return TerminalType.TERMINAL;
  }
}
