import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Card } from "../../card";
import { HeuristicType, TerminalType } from "@src/core/logic/card_selector";

const Name = "Curse";

export class Curse extends Card {
  constructor() {
    super(Name, [CardType.CURSE]);
  }

  public static get NAME(): string {
    return Name;
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.VICTORY;
  }

  victoryPoints(): number {
    return -1;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.JUNK;
  }

  terminalType(): TerminalType {
    return TerminalType.NONPLAYABLE;
  }
}
