import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { CardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectAction, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";

const Name = "Watchtower";

export class Watchtower extends Card {
  selectionMap: Map<number, Effect>;
  constructor() {
    super(Name, [CardType.ACTION]);
    this.selectionMap = new Map();
    this.selectionMap.set(
      0,
      new Effect(
        EffectAction.TRASH,
        EffectPlayer.SELF,
        undefined,
        undefined,
        this,
      ),
    );
    this.selectionMap.set(
      1,
      new Effect(
        EffectAction.TOPDECK,
        EffectPlayer.SELF,
        undefined,
        undefined,
        this,
      ),
    );
    this.selectionMap.set(
      2,
      new Effect(
        EffectAction.PASS,
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

  heuristicType(): CardHeuristicType {
    return CardHeuristicType.TERMINAL_DRAW;
  }

  playGraph(): Graph {
    const graph = new Graph();
    const draw = new PlayNode(
      new Effect(EffectAction.DRAW_TO, EffectPlayer.SELF, 6, undefined, this),
    );
    graph.addNode(draw);
    return graph;
  }

  inHandWhileGaining(card: Card): Decision | undefined {
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
}
