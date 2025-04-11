/* tslint:disable:no-unused-variable */
import {
  DeprecatedCardHeuristicType,
  InteractionType,
  CardType,
  DurationPhase,
} from "./card_types";
import { Decision, DecisionType } from "./decisions";
import { Effect, EffectPlayer, EffectType } from "./effects";
import { Graph, PlayNode } from "./graph";
import { HeuristicType, TerminalType } from "./logic/card_selector_types";
import { Player } from "./player";

export const NULL_CARD_NAME = "NULL";

export class Card {
  name: string;
  types: CardType[];
  graph = new Graph();

  durationGraph: Graph | undefined;
  durationPhase: DurationPhase | undefined;

  whenGainedGraph: Graph;
  setAsideDecision: Decision | undefined;

  constructor(name: string, types: CardType[]) {
    this.name = name;
    this.types = types;

    this.whenGainedGraph = this.baseWhenGainedGraph();
  }

  public static get NAME(): string {
    return "Name not implemented";
  }

  toString(): string {
    return this.name;
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.name;
  }

  playGraph(): Graph {
    return this.graph;
  }

  durationPlayGraph(): Graph | undefined {
    return this.durationGraph;
  }

  victoryPoints(): number {
    return 0;
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.NULL;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.JUNK;
  }

  terminalType(): TerminalType {
    return TerminalType.NONPLAYABLE;
  }

  staysInPlay(): boolean {
    if (this.durationPhase === DurationPhase.REMAINS_IN_PLAY) {
      return true;
    } else {
      return false;
    }
  }

  cost(): number {
    return 0;
  }

  static factoryGenerator(): Card {
    return new Card("", []);
  }

  effectiveCost(
    globalReduction: number,
    _specificReductionCount?: number | undefined,
  ): number {
    return Math.max(0, this.cost() - globalReduction);
  }

  specificReductionInteraction(): InteractionType | undefined {
    return undefined;
  }

  economyHeuristicValue(): number {
    return 0;
  }

  drawHeuristicValue(_player?: Player): number {
    return 0;
  }

  // section: card effects that can be triggered by game events
  whenInHandWhileGaining(_card: Card): Decision | undefined {
    return undefined;
  }

  // section: relatively rare effect definitions
  typeBonusMap(): Map<CardType, Effect> {
    return new Map();
  }

  private baseWhenGainedGraph(): Graph {
    const graph = new Graph();

    const exileDecision = new Decision(
      DecisionType.EXILE_DISCARD,
      EffectPlayer.SELF,
      undefined,
      this,
    );
    const exileDecisionNode = new PlayNode(exileDecision);
    const exileDiscardEffect = new Effect(
      EffectType.EXILE_DISCARD,
      EffectPlayer.SELF,
      undefined,
      exileDecision,
      this,
    );
    const exileDiscardNode = new PlayNode(exileDiscardEffect);

    graph.addNode(exileDecisionNode);
    graph.addNode(exileDiscardNode);
    graph.addEdge(exileDecisionNode, exileDiscardNode);

    return graph;
  }
}
