/* tslint:disable:no-unused-variable */
import {
  CardHeuristicType,
  InteractionType,
  CardType,
  DurationPhase,
} from "./card_types";
import { Decision } from "./decisions";
import { Effect } from "./effects";
import { Graph } from "./graph";

export class Card {
  name: string;
  types: CardType[];
  graph = new Graph();

  durationGraph: Graph | undefined;
  durationPhase: DurationPhase | undefined;

  setAsideDecision: Decision | undefined;

  constructor(name: string, types: CardType[]) {
    this.name = name;
    this.types = types;
  }

  public static get NAME(): string {
    return "Name not implemented";
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

  heuristicType(): CardHeuristicType {
    return CardHeuristicType.NULL;
  }

  staysInPlay(): boolean {
    return false;
  }

  cost(): number {
    return 0;
  }

  static factoryGenerator(): Card {
    return new Card("", []);
  }

  effectiveCost(
    globalReduction: number,
    specificReductionCount?: number | undefined,
  ): number {
    if (specificReductionCount) {
      throw new Error(
        "Invalid state: effective cost requested with a value for specific reduction on a card with no specific reduction rule set",
      );
    }
    return Math.max(0, this.cost() - globalReduction);
  }

  specificReductionInteraction(): InteractionType | undefined {
    return undefined;
  }

  inHandWhileGaining(_card: Card): Decision | undefined {
    return undefined;
  }

  typeBonusMap(): Map<CardType, Effect> {
    return new Map();
  }
}
