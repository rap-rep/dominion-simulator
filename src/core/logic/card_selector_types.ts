import { Card } from "../card";
import { CardType } from "../card_types";
import { Player } from "../player";

export enum TerminalType {
  TERMINAL = "TERMINAL",
  NONTERMINAL = "NONTERMINAL",
  NONPLAYABLE = "NONPLAYABLE",
}

export enum HeuristicType {
  TREASURE = "TREASURE",
  CANTRIP = "CANTRIP",
  DRAW = "DRAW",
  DRAW_TO_X = "DRAW_TO_X",
  PAYLOAD_COINS = "PAYLOAD_COINS",
  FROM_DECK_SIFTER = "FROM_DECK_SIFTER",
  FROM_HAND_SIFTER = "FROM_HAND_SIFTER",
  VILLAGE = "VILLAGE",
  PAYLOAD_GAINER = "PAYLOAD_GAINER",
  VICTORY = "VICTORY",
  TRASHER = "TRASHER",
  JUNK = "JUNK",
}

export type SelectorDrawCriteria = {
  allPotential?: boolean | undefined;
  atLeastOne?: boolean | undefined;
};

export type CardSelectorCriteria = {
  sortByValueFn?: ((card: Card, player: Player) => number) | undefined;

  alwaysSelect?: boolean | undefined;
  cardName?: string | undefined;
  type?: CardType | undefined;
  terminalType?: TerminalType | undefined;
  heuristicType?: HeuristicType | undefined;
  actionsGE?: number | undefined;
  drawCriteria?: SelectorDrawCriteria | undefined;

  // For use in trashing decisions based on total deck economy
  doNotSelectIfEconomyBelow?: number | undefined;
};
