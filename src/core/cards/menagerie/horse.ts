import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";
import { Player } from "@src/core/player";

const Name = "Horse";

export class Horse extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.NONTERMINAL_DRAW;
  }

  static factoryGenerator(): Horse {
    return new Horse();
  }

  playGraph(): Graph {
    const graph = new Graph();

    const draw = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 2, undefined, this),
    );
    const action = new PlayNode(
      new Effect(EffectType.PLUS_ACTION, EffectPlayer.SELF, 1, undefined, this),
    );
    const returnCard = new PlayNode(
        new Effect(EffectType.RETURN_TO_NON_SUPPLY_PILE, EffectPlayer.SELF, 1, undefined, this),
    );

    graph.addNode(draw);
    graph.addNode(action);
    graph.addNode(returnCard);
    graph.addEdge(draw, action);
    graph.addEdge(action, returnCard);

    return graph;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.DRAW;
  }

  terminalType(): TerminalType {
    return TerminalType.NONTERMINAL;
  }

  drawHeuristicValue(_player: Player): number {
    return 2;
  }

  cost(): number {
    return 3;
  }
}
