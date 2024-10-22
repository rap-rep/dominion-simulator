import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { Player } from "@src/core/player";

const Name = "Watchtower";

export class Watchtower extends Card {
  selectionMap: Map<number, Effect>;
  constructor() {
    super(Name, [CardType.ACTION]);
    this.selectionMap = new Map();
    this.selectionMap.set(
      0,
      new Effect(
        EffectType.TRASH_FROM_HAND,
        EffectPlayer.SELF,
        undefined,
        undefined,
        this,
      ),
    );
    this.selectionMap.set(
      1,
      new Effect(
        EffectType.TOPDECK,
        EffectPlayer.SELF,
        undefined,
        undefined,
        this,
      ),
    );
    this.selectionMap.set(
      2,
      new Effect(
        EffectType.PASS,
        EffectPlayer.SELF,
        undefined,
        undefined,
        this,
      ),
    );
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Watchtower {
    return new Watchtower();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TERMINAL_DRAW;
  }

  playGraph(): Graph {
    const graph = new Graph();
    const draw = new PlayNode(
      new Effect(EffectType.DRAW_TO, EffectPlayer.SELF, 6, undefined, this),
    );
    graph.addNode(draw);
    return graph;
  }

  whenInHandWhileGaining(card: Card): Decision | undefined {
    for (let i = 0; i < 3; i++) {
      const effect = this.selectionMap.get(i);
      if (!effect) {
        throw new Error(
          "In hand decision selection map does not contain correct element numbers",
        );
      }
      effect.affects = card;
    }
    return new Decision(
      DecisionType.SELECT_EFFECT,
      EffectPlayer.SELF,
      undefined,
      this,
      this.selectionMap,
    );
  }

  cost(): number {
    return 3;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.DRAW_TO_X;
  }

  terminalType(): TerminalType {
    return TerminalType.TERMINAL;
  }

  drawHeuristicValue(player: Player): number {
    // TODO update to use owner rather than current player
    return Math.max(0, 7 - PlayerHelper.countHandSize(player));
  }
}
