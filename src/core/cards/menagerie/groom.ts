import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";
import { Silver } from "../basic/silver";
import { Horse } from "./horse";

const Name = "Groom";

export class Groom extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Groom {
    return new Groom();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TERMINAL_GAINER;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.PAYLOAD_GAINER;
  }

  terminalType(): TerminalType {
    return TerminalType.TERMINAL;
  }

  typeBonusMap() {
    const map: Map<CardType, Effect> = new Map();
    map.set(
      CardType.VICTORY,
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 1, undefined, this),
    );
    map.set(
      CardType.VICTORY,
      new Effect(EffectType.PLUS_ACTION, EffectPlayer.SELF, 1, undefined, this),
    );
    const gainSilver = new Effect(
      EffectType.GAIN_FROM_SUPPLY,
      EffectPlayer.SELF,
      1,
      undefined,
      this,
    );
    gainSilver.reference = new Decision(
      DecisionType.PLACEHOLDER,
      EffectPlayer.SELF,
      undefined,
      this,
    );
    gainSilver.reference.result = Silver.NAME;
    map.set(CardType.TREASURE, gainSilver);

    const gainHorse = new Effect(
        EffectType.GAIN_FROM_NON_SUPPLY,
        EffectPlayer.SELF,
        1,
        undefined,
        this,
      );
      gainHorse.reference = new Decision(
        DecisionType.PLACEHOLDER,
        EffectPlayer.SELF,
        undefined,
        this,
      );
      gainHorse.reference.result = Horse.NAME;

      map.set(CardType.ACTION, gainHorse);
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
      EffectType.GAIN_FROM_SUPPLY,
      EffectPlayer.SELF,
      undefined,
      gainCardDecision,
      this,
    );
    const gainNode = new PlayNode(gainEffect);
    const bonusNode = new PlayNode(
      new Effect(
        EffectType.TYPE_BONUSES,
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
