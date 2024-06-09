import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";
import { CardSelector } from "@src/core/logic/card_selector";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";
import { Player } from "@src/core/player";
import { DefaultCriteria } from "@src/core/logic/default_selection_criteria";

const Name = "Chapel";

export class Chapel extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Chapel {
    return new Chapel();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TRASHER;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.TRASHER;
  }

  terminalType(): TerminalType {
    return TerminalType.TERMINAL;
  }

  playGraph(): Graph {
    const graph = new Graph();

    const selectTrashDecision = new Decision(
      DecisionType.TRASH_FROM_HAND,
      EffectPlayer.SELF,
      4,
      this,
    );

    const selectTrash = new PlayNode(selectTrashDecision);

    const trash = new PlayNode(
      new Effect(
        EffectType.TRASH_FROM_HAND,
        EffectPlayer.SELF,
        undefined,
        selectTrashDecision,
        this,
      ),
    );

    graph.addNode(selectTrash);
    graph.addNode(trash);
    graph.addEdge(selectTrash, trash);
    return graph;
  }

  cost(): number {
    return 2;
  }

  static defaultChapelDecision(player: Player, decision: Decision) {
    const priorityList = DefaultCriteria.trashCardsOptional();
    const selector = new CardSelector(player, priorityList);

    if (!decision.amount || decision.amount !== 4) {
      throw new Error("Chapel defined incorrectly");
    }

    const cards = selector.getCardsFromCriteria(
      player.hand,
      decision.amount,
      0,
    );
    decision.result = cards;
  }
}
