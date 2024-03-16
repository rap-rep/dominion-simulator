import { CardHeuristicType, CardType } from "@src/core/card_types";
import { Card } from "../../card";

const Name = "Estate";

export class Estate extends Card {
  constructor() {
    super(Name, [CardType.VICTORY]);
  }

  public static get NAME(): string {
    return Name;
  }

  victoryPoints(): number {
    return 1;
  }

  heuristicType(): CardHeuristicType {
    return CardHeuristicType.VICTORY;
  }

  cost(): number {
    return 2;
  }
}
