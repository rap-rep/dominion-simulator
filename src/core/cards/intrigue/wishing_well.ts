import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";
import { Player } from "@src/core/player";
import { Decision, DecisionType } from "@src/core/decisions";

const Name = "Wishing Well";

export class WishingWell extends Card {
  // TODO WARNING: NotImplemented
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.VILLAGE;
  }

  static factoryGenerator(): WishingWell {
    return new WishingWell();
  }

  playGraph(): Graph {
    const graph = new Graph();

    const draw = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 1, undefined, this),
    );
    const action = new PlayNode(
      new Effect(EffectType.PLUS_ACTION, EffectPlayer.SELF, 1, undefined, this),
    );

    const guessDrawDecision = new Decision(
      DecisionType.GUESS_CARD_TO_DRAW,
      EffectPlayer.SELF,
      undefined,
      this,
    );
    const decisionNode = new PlayNode(guessDrawDecision);

    graph.addNode(draw);
    graph.addNode(action);
    graph.addEdge(draw, action);

    return graph;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.DRAW;
  }

  terminalType(): TerminalType {
    return TerminalType.NONTERMINAL;
  }

  drawHeuristicValue(_player: Player): number {
    // TODO make this dynamic
    return 0.3;
  }

  cost(): number {
    return 3;
  }
}
