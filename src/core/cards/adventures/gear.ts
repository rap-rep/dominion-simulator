import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import {
  DeprecatedCardHeuristicType,
  CardType,
  DurationPhase,
} from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { Player } from "@src/core/player";
import { HeuristicType, TerminalType } from "@src/core/logic/card_selector_types";

const Name = "Gear";

export class Gear extends Card {
  setAsideDecision: Decision | undefined;
  durationPhase: DurationPhase | undefined;
  constructor() {
    super(Name, [CardType.ACTION, CardType.DURATION]);

    this.setAsideDecision = new Decision(
      DecisionType.SET_ASIDE_ON_FROM_HAND,
      EffectPlayer.SELF,
      2,
    );

    this.durationPhase = DurationPhase.REMAINS_IN_PLAY;
  }

  public static get NAME(): string {
    return Name;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.DRAW;
  }

  terminalType(): TerminalType {
    return TerminalType.TERMINAL;
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TERMINAL_DRAW;
  }

  playGraph(): Graph {
    if (!this.setAsideDecision) {
      throw new Error("Set aside decision not specified");
    }
    this.setAsideDecision.fromCard = this;
    const graph = new Graph();
    const draw = new PlayNode(
      new Effect(EffectType.DRAW_CARD, EffectPlayer.SELF, 2, undefined, this),
    );

    const setAside = new PlayNode(this.setAsideDecision);
    graph.addNode(draw);
    graph.addNode(setAside);
    graph.addEdge(draw, setAside);
    return graph;
  }

  durationPlayGraph(): Graph {
    const graph = new Graph();

    const inHand = new PlayNode(
      new Effect(
        EffectType.IN_HAND_FROM_SET_ASIDE,
        EffectPlayer.SELF,
        undefined,
        this.setAsideDecision,
        this,
      ),
    );

    graph.addNode(inHand);
    return graph;
  }

  cost(): number {
    return 3;
  }

  static defaultGearDecision(player: Player, decision: Decision) {
    const setAside: Card[] = new Array();
    for (let i = 0; i < 2; i++) {
      const setAsideCard = Gear.defaultGearSingleCardDecision(player, setAside);
      if (!setAsideCard) {
        break;
      } else {
        setAside.push(setAsideCard);
      }
    }
    for (const card of setAside) {
      player.removeCardFromHand(card);
    }
    if (decision.result) {
      decision.fromCard.durationPhase = DurationPhase.PREPARED_FOR_CLEANUP;
    }
    decision.result = setAside;
  }

  private static defaultGearSingleCardDecision(
    player: Player,
    alreadySelected: Card[],
  ): Card | undefined {
    let priorityList: DeprecatedCardHeuristicType[] = [];

    let alreadySelectedCard: Card | undefined;
    if (alreadySelected.length > 0) {
      alreadySelectedCard = alreadySelected[0];
    }

    if (player.actions === 0) {
      // TODO: Implement holding back treasures when excess available
      priorityList = [
        DeprecatedCardHeuristicType.NONTERMINAL_DRAW,
        DeprecatedCardHeuristicType.VILLAGE,
        DeprecatedCardHeuristicType.TRASHER,
        DeprecatedCardHeuristicType.TERMINAL_DRAW,
        DeprecatedCardHeuristicType.TERMINAL_PAYLOAD,
        DeprecatedCardHeuristicType.CANTRIP,
        DeprecatedCardHeuristicType.NONTERMINAL_FROM_DECK_SIFTER,
        DeprecatedCardHeuristicType.NONTERMINAL_HAND_SIFTER,
        DeprecatedCardHeuristicType.NONTERMINAL_GAINER,
        DeprecatedCardHeuristicType.TERMINAL_GAINER,
        DeprecatedCardHeuristicType.NONTERMINAL_PAYLOAD,
        DeprecatedCardHeuristicType.TERMINAL_FROM_DECK_SIFTER,
        DeprecatedCardHeuristicType.VICTORY,
      ];
      for (const heuristicType of priorityList) {
        const card = PlayerHelper.getCardOfHeuristicType(
          player,
          heuristicType,
          alreadySelectedCard,
        );
        if (card) {
          return card;
        }
      }
    } else {
      priorityList = [DeprecatedCardHeuristicType.VICTORY];

      for (const heuristicType of priorityList) {
        const card = PlayerHelper.getCardOfHeuristicType(
          player,
          heuristicType,
          alreadySelectedCard,
        );
        if (card) {
          return card;
        }
      }
    }
    return undefined;
  }
}
