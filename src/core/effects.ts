import { Card } from "@src/core/card";
import { Decision } from "./decisions";
import { NodeType } from "./graph";
import { CardType } from "./card_types";

/* Effects are everything that changes the game state
 * Effects are completely tokenized so that cards can simply report what they intend to do
 * and the game engine can carry out the effect, while making it loggable and searchable
 *
 * These are not to be confused with "Decisions", which do not affect the game state directly,
 * but rather lead to the generation of new Effects
 */

export enum EffectType {
  // Basic descriptor of the effect
  PASS = "Pass",

  // Core game state changes
  PLUS_ACTION = "+ Action",
  PLUS_COIN = "+ Coin",
  PLUS_BUY = "+ Buy",
  DRAW_CARD = "Draw",
  DRAW_TO = "Draw to",
  TOPDECK = "Topdeck",
  TRASH_FROM_HAND = "Trash",
  DISCARD_FROM_HAND = "Discard",
  GAIN_FROM_SUPPLY = "Gain",
  TYPE_BONUSES = "Type bonuses",

  // Token counter changes
  PLUS_VILLAGER = "+ Villager",
  PLUS_COFFER = "+ Coffer",

  // Other common effects
  IN_HAND_FROM_SET_ASIDE = "Put in hand from set aside",

  // Reveals
  REVEAL_DECK = "Reveal deck",
  REVEAL_HAND = "Reveal hand",

  //// Set specific
  // adventures
  FLIP_JOURNEY = "Flip journey token",
  DRAW_IF_JOURNEY_UP = "Draw (if journey up)",
  // menagerie
  EXILE_FROM_PLAY = "Exile",
  EXILE_DISCARD = "Discard from exile",

}

export enum EffectPlayer {
  SELF = 1,
  OPP = 2,
}

export class Effect {
  effectType: EffectType;
  effectPlayer: EffectPlayer;
  affects: Card | Card[] | number | string | undefined | number[];
  reference: Decision | Effect | undefined;
  nodeType: NodeType;
  result: string | Card | undefined;
  fromCard: Card;
  referenceIndex: number | undefined;

  constructor(
    effectType: EffectType,
    effectPlayer: EffectPlayer,
    affects?: Card | Card[] | number | undefined | string | number[],
    reference?: Decision | Effect | undefined,
    fromCard?: Card,
    referenceIndex?: number,
  ) {
    this.effectType = effectType;
    this.affects = affects;
    this.effectPlayer = effectPlayer;
    this.reference = reference;
    this.nodeType = NodeType.EFFECT;
    if (fromCard) {
      this.fromCard = fromCard;
    }
    else{
      this.fromCard = new Card("NULL", [CardType.NULL]);
    }
    this.referenceIndex = referenceIndex;
  }
}
