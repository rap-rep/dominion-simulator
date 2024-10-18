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

export type CardSelectorCriteria = {
  alwaysSelect?: boolean | undefined;
  cardName?: string | undefined;
  terminalType?: TerminalType | undefined;
  heuristicType?: HeuristicType | undefined;
  actionsGE?: number | undefined;

  // For use in trashing decisions based on total deck economy
  doNotSelectIfEconomyBelow?: number | undefined;
};
