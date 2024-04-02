import { Graph } from "@src/core/graph";
import { Card } from "../../card";
import { DeprecatedCardHeuristicType, CardType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";

const Name = "Province";

export class Province extends Card {
  constructor() {
    super(Name, [CardType.VICTORY]);
  }

  public static get NAME(): string {
    return Name;
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
}
