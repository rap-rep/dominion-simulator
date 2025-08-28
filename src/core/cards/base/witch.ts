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
import { Curse } from "../basic/curse";

const Name = "Witch";

export class Witch extends Card {
  constructor() {
    super(Name, [CardType.ACTION, CardType.ATTACK]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Witch {
    return new Witch();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TERMINAL_DRAW;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.DRAW;
  }

  drawHeuristicValue(_player: Player): number {
    return 2;
  }

  terminalType(): TerminalType {
    return TerminalType.TERMINAL;
  }

  playGraph(): Graph {
    const graph = new Graph();
    const draw = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 2, undefined, this),
    );
    const gainReference = new Decision(
      DecisionType.PLACEHOLDER,
      EffectPlayer.OPP,
    );
    gainReference.result = Curse.NAME;

    const giveCurse = new PlayNode(
      new Effect(
        EffectType.GAIN_FROM_SUPPLY,
        EffectPlayer.OPP,
        undefined,
        gainReference,
        this,
      ),
    );
    graph.addNode(draw);
    graph.addNode(giveCurse);
    graph.addEdge(draw, giveCurse);
    return graph;
  }

  cost(): number {
    return 5;
  }
}
