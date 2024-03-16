import { CardHeuristicType, CardType } from "@src/core/card_types";
import { Card } from "../../card";

const Name = "Curse";

export class Curse extends Card {
  constructor() {
    super(Name, [CardType.CURSE]);
  }

  public static get NAME(): string {
    return Name;
  }

  heuristicType(): CardHeuristicType {
    return CardHeuristicType.VICTORY;
  }

  victoryPoints(): number {
    return -1;
  }
}
