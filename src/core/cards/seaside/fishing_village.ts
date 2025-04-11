import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { 
  DeprecatedCardHeuristicType, 
  CardType,
  DurationPhase 
} from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";
import { Player } from "@src/core/player";

const Name = "Fishing Village";

export class FishingVillage extends Card {
  durationPhase: DurationPhase | undefined;
  
  constructor() {
    super(Name, [CardType.ACTION, CardType.DURATION]);
    this.durationPhase = DurationPhase.REMAINS_IN_PLAY;
  }

  public static get NAME(): string {
    return Name;
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.VILLAGE;
  }

  static factoryGenerator(): FishingVillage {
    return new FishingVillage();
  }

  playGraph(): Graph {
    const graph = new Graph();
    
    const coin = new PlayNode(
      new Effect(EffectType.PLUS_COIN, EffectPlayer.SELF, 1, undefined, this),
    );

    const action = new PlayNode(
      new Effect(EffectType.PLUS_ACTION, EffectPlayer.SELF, 2, undefined, this),
    );

    graph.addNode(coin);
    graph.addNode(action);
    graph.addEdge(coin, action);

    return graph;
  }
  
  durationPlayGraph(): Graph {
    const graph = new Graph();
    
    const coin = new PlayNode(
      new Effect(EffectType.PLUS_COIN, EffectPlayer.SELF, 1, undefined, this),
    );

    const action = new PlayNode(
      new Effect(EffectType.PLUS_ACTION, EffectPlayer.SELF, 1, undefined, this),
    );

    graph.addNode(coin);
    graph.addNode(action);
    graph.addEdge(coin, action);

    return graph;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.VILLAGE;
  }

  terminalType(): TerminalType {
    return TerminalType.NONTERMINAL;
  }

  drawHeuristicValue(_player: Player): number {
    return 1;
  }

  cost(): number {
    return 3;
  }
}