import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import {
  ActionHeuristicType,
  CardType,
  DurationPhase,
} from "@src/core/card_types";
import { Effect, EffectAction, EffectPlayer } from "@src/core/effects";
import { Decision, DecisionType } from "@src/core/decisions";
import { PlayerHelper } from "@src/core/helpers/default_decisions";
import { Player } from "@src/core/player";

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

  heuristicType(): ActionHeuristicType {
    return ActionHeuristicType.TERMINAL_DRAW;
  }

  staysInPlay(): boolean {
    if (this.durationPhase === DurationPhase.REMAINS_IN_PLAY) {
      return true;
    } else {
      return false;
    }
  }

  playGraph(): Graph {
    if (!this.setAsideDecision) {
      throw new Error("Set aside decision not specified");
    }
    this.setAsideDecision.fromCard = this;
    const graph = new Graph();
    const draw = new PlayNode(
      new Effect(EffectAction.DRAW_CARD, EffectPlayer.SELF, 2),
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
        EffectAction.IN_HAND_FROM_SET_ASIDE,
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
      const setAsideCard = Gear.gearSingleCardDecision(player, setAside);
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

  private static gearSingleCardDecision(
    player: Player,
    alreadySelected: Card[],
  ): Card | undefined {
    let priorityList: ActionHeuristicType[] = [];

    let alreadySelectedCard: Card | undefined;
    if (alreadySelected.length > 0) {
      alreadySelectedCard = alreadySelected[0];
    }

    if (player.actions === 0) {
      // TODO: Implement holding back treasures when excess available
      priorityList = [
        ActionHeuristicType.NONTERMINAL_DRAW,
        ActionHeuristicType.VILLAGE,
        ActionHeuristicType.TRASHER,
        ActionHeuristicType.TERMINAL_DRAW,
        ActionHeuristicType.TERMINAL_PAYLOAD,
        ActionHeuristicType.CANTRIP,
        ActionHeuristicType.NONTERMINAL_FROM_DECK_SIFTER,
        ActionHeuristicType.HAND_SIFTER,
        ActionHeuristicType.NONTERMINAL_GAINER,
        ActionHeuristicType.TERMINAL_GAINER,
        ActionHeuristicType.NONTERMINAL_PAYLOAD,
        ActionHeuristicType.TERMINAL_FROM_DECK_SIFTER,
        ActionHeuristicType.VICTORY,
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
      priorityList = [ActionHeuristicType.VICTORY];

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
