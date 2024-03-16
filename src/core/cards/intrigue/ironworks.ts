import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { CardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectAction, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";

const Name = "Ironworks";

export class Ironworks extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  heuristicType(): CardHeuristicType {
    return CardHeuristicType.NONTERMINAL_GAINER;
  }

  typeBonusMap() {
    const map: Map<CardType, Effect> = new Map();
    map.set(
      CardType.ACTION,
      new Effect(
        EffectAction.PLUS_ACTION,
        EffectPlayer.SELF,
        1,
        undefined,
        this,
      ),
    );
    map.set(
      CardType.VICTORY,
      new Effect(EffectAction.DRAW_CARD, EffectPlayer.SELF, 1, undefined, this),
    );
    map.set(
      CardType.TREASURE,
      new Effect(EffectAction.PLUS_COIN, EffectPlayer.SELF, 1, undefined, this),
    );
    return map;
  }

  playGraph(): Graph {
    const graph = new Graph();
    const gainCardDecision = new Decision(
      DecisionType.GAIN_CARD_UP_TO,
      EffectPlayer.SELF,
      4,
      this,
    );
    const decisionNode = new PlayNode(gainCardDecision);
    const gainEffect = new Effect(
      EffectAction.GAIN_FROM_SUPPLY,
      EffectPlayer.SELF,
      undefined,
      gainCardDecision,
      this,
    );
    const gainNode = new PlayNode(gainEffect);
    const bonusNode = new PlayNode(
      new Effect(
        EffectAction.TYPE_BONUSES,
        EffectPlayer.SELF,
        undefined,
        gainEffect,
        this,
      ),
    );

    graph.addNode(decisionNode);
    graph.addNode(gainNode);
    graph.addNode(bonusNode);
    graph.addEdge(decisionNode, gainNode);
    graph.addEdge(gainNode, bonusNode);
    return graph;
  }

  cost(): number {
    return 4;
  }
}
