import { CardType } from "@src/core/card_types";
import { Card } from "../../card";

const Name = "NULL";

export class NullCard extends Card {
  // Not a real card: used to indicate no card being selected/available
  constructor() {
    super(Name, [CardType.NULL]);
  }

  public static get NAME(): string {
    return Name;
  }
}
