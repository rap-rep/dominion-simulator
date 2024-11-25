import { Card } from "./card";
import { CardType } from "./card_types";
import { Effect, EffectPlayer } from "./effects";
import { NodeType } from "./graph";

export enum DecisionType {
  // Standard play decisions
  PLAY_ACTION = "Play action",
  PLAY_TREASURE = "Play treasure",
  BUY_CARD = "Buy card",

  // Selections
  SELECT_EFFECT = "Select effect",

  // Common card decisions
  TRASH_FROM_HAND = "Trash from hand",
  NAME_CARD = "Name card",
  GAIN_CARD_UP_TO = "Gain card up to",
  GAIN_CARD_EXACTLY = "Gain card costing exactly",
  SET_ASIDE_ON_FROM_HAND = "Set aside from hand",
  DISCARD_TO = "Discard to",
  DISCARD = "Discard",

  // Set mechanic based card decisions
  EXILE_DISCARD = "Discard from exile",

  // Unique to the card decisions


  // Other types of Decision
  // for when a decision object is expected, but there is no decision needed
  PLACEHOLDER = "Placeholder", 
}

export class Decision {
  decisionType: DecisionType;
  effectPlayer: EffectPlayer;
  amount: number | undefined;
  amountMinimum: number | undefined;
  nodeType: NodeType;
  result: string | Card | Card[] | undefined | number | number[] | boolean;
  fromCard: Card;
  selectionMap?: Map<number, Effect>;

  constructor(
    decisionType: DecisionType,
    effectPlayer: EffectPlayer,
    amount?: number | undefined,
    fromCard?: Card,
    selectionMap?: Map<number, Effect>,
    amountMinimum?: number | undefined,
  ) {
    this.decisionType = decisionType;
    this.effectPlayer = effectPlayer;
    this.amount = amount;
    this.amountMinimum = amountMinimum;
    this.nodeType = NodeType.DECISION;
    this.selectionMap = selectionMap;
    if (fromCard) {
      this.fromCard = fromCard;
    } else {
      this.fromCard = new Card("NULL", [CardType.NULL]);
    }
  }
}
