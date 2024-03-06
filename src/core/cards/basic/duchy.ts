import { ActionHeuristicType, CardType } from "@src/core/card_types";
import { Card } from "../../card";

const Name = "Duchy";

export class Duchy extends Card {
  constructor() {
    super(Name, [CardType.VICTORY]);
  }

  public static get NAME(): string {
    return Name;
  }

  heuristicType(): ActionHeuristicType {
    return ActionHeuristicType.VICTORY;
  }

  victoryPoints(): number {
    return 3;
  }

  cost(): number {
    return 5;
  }
}
