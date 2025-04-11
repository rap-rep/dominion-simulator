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
import { Player } from "@src/core/player";
import { Gold } from "../basic/gold";

const Name = "Wharf";

export class Wharf extends Card {
  durationPhase: DurationPhase | undefined;
  constructor() {
    super(Name, [CardType.ACTION, CardType.DURATION]);

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
    return graph;
  }

  durationPlayGraph(): Graph {
    const graph = new Graph();

    const gainGold = new Effect(
      EffectType.GAIN_FROM_SUPPLY,
      EffectPlayer.SELF,
      1,
      undefined,
      this,
    );
    gainGold.reference = new Decision(
      DecisionType.PLACEHOLDER,
      EffectPlayer.SELF,
      undefined,
      this,
    );
    gainGold.reference.result = Gold.NAME;


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

  drawHeuristicValue(_player?: Player | undefined): number {
    return 2;
  }
}
