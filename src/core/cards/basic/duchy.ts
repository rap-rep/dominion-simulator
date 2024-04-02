import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Card } from "../../card";
import { HeuristicType, TerminalType } from "@src/core/logic/card_selector";

const Name = "Duchy";

export class Duchy extends Card {
  constructor() {
    super(Name, [CardType.VICTORY]);
  }

  public static get NAME(): string {
    return Name;
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.VICTORY;
  }

  victoryPoints(): number {
    return 3;
  }

  cost(): number {
    return 5;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.VICTORY;
  }

  terminalType(): TerminalType {
    return TerminalType.NONPLAYABLE;
  }
}
