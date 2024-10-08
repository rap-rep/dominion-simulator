import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";

const Name = "Province";

export class Province extends Card {
  constructor() {
    super(Name, [CardType.VICTORY]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Province {
    return new Province();
  }

  victoryPoints(): number {
    return 6;
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.VICTORY;
  }

  cost(): number {
    return 8;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.VICTORY;
  }

  terminalType(): TerminalType {
    return TerminalType.NONPLAYABLE;
  }
}
