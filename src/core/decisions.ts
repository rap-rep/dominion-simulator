import { Card } from "./card";
import { NullCard } from "./cards/basic/null_card";
import { Effect, EffectPlayer } from "./effects";
import { NodeType } from "./graph";

const NULL_CARD = new NullCard();

export enum DecisionType {
  // Standard play decisions
  PLAY_ACTION = "Play action",
  PLAY_TREASURE = "Play treasure",
  BUY_CARD = "Buy card",

  // Selections
  SELECT_EFFECT = "Select effect",

  // Card decisions
  TRASH_CARD = "Trash card",
  NAME_CARD = "Name card",
  GAIN_CARD_UP_TO = "Gain card up to",
  GAIN_CARD_EXACTLY = "Gain card exactly",

  // Less common card decisions
  SET_ASIDE_ON_FROM_HAND = "Set aside from hand",

  // Unique Decisions
}

export class Decision {
  decisionType: DecisionType;
  effectPlayer: EffectPlayer;
  amount: number | undefined;
  nodeType: NodeType;
  result: string | Card | Card[] | undefined | number | number[];
  fromCard: Card = NULL_CARD;
  selectionMap?: Map<number, Effect>;

  constructor(
    decisionType: DecisionType,
    effectPlayer: EffectPlayer,
    amount?: number | undefined,
    fromCard?: Card,
    selectionMap?: Map<number, Effect>,
  ) {
    this.decisionType = decisionType;
    this.effectPlayer = effectPlayer;
    this.amount = amount;
    this.nodeType = NodeType.DECISION;
    this.selectionMap = selectionMap;
    if (fromCard) {
      this.fromCard = fromCard;
    }
  }
}
