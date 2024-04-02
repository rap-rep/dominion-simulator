import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Card } from "../../card";
import { HeuristicType, TerminalType } from "@src/core/logic/card_selector";

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

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.VICTORY;
  }
  heuristicType(): HeuristicType {
    return HeuristicType.VICTORY;
  }

  terminalType(): TerminalType {
    return TerminalType.NONPLAYABLE;
  }

  cost(): number {
    return 2;
  }
}
