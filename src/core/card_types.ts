export enum CardType {
  // Basic
  ACTION = "Action",
  TREASURE = "Treasure",
  VICTORY = "Victory",
  ATTACK = "Attack",
  CURSE = "Curse",

  // Extended (common)
  DURATION = "Duration",

  // Extended (uncommon)

  NULL = "NULL",
}

export enum DurationPhase {
  REMAINS_IN_PLAY,
  PREPARED_FOR_CLEANUP,
}

export enum InteractionType {
  ACTIONS_IN_PLAY_DURING_BUY = 1,
}

export enum DeprecatedCardHeuristicType {
  TREASURE = 0,
  CANTRIP = 1,
  TERMINAL_DRAW = 2,
  NONTERMINAL_DRAW = 3,
  TERMINAL_PAYLOAD = 4,
  NONTERMINAL_PAYLOAD = 5,
  NONTERMINAL_FROM_DECK_SIFTER = 6,
  TERMINAL_FROM_DECK_SIFTER = 7,
  NONTERMINAL_HAND_SIFTER = 8,
  VILLAGE = 9,
  NONTERMINAL_GAINER = 10,
  TERMINAL_GAINER = 11,
  VICTORY = 12,
  TRASHER = 13,
  NULL = 14,
}
