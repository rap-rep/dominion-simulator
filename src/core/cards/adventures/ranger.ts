import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";
import { Game } from "@src/core/game";
import { Player } from "@src/core/player";

const Name = "Ranger";

export class Ranger extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Ranger {
    return new Ranger();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TERMINAL_DRAW;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.DRAW;
  }

  terminalType(): TerminalType {
    return TerminalType.TERMINAL;
  }

  playGraph(): Graph {
    const graph = new Graph();

    const buy = new PlayNode(
      new Effect(EffectType.PLUS_BUY, EffectPlayer.SELF, 1, undefined, this),
    );

    const flipJourney = new PlayNode(
      new Effect(
        EffectType.FLIP_JOURNEY,
        EffectPlayer.SELF,
        undefined,
        undefined,
        this,
      ),
    );

    const drawConditional = new PlayNode(
      new Effect(
        EffectType.DRAW_IF_JOURNEY_UP,
        EffectPlayer.SELF,
        5,
        undefined,
        this,
      ),
    );

    graph.addNode(buy);
    graph.addNode(flipJourney);
    graph.addNode(drawConditional);

    graph.addEdge(buy, flipJourney);
    graph.addEdge(flipJourney, drawConditional);
    return graph;
  }

  cost(): number {
    return 4;
  }

  drawHeuristicValue(player: Player): number {
    // TODO update this to use owner's token rather than just current player
    if (player.journeyTokenUp){
      return 4;
    }
    return 0;
  }

}
