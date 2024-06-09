import { Copper } from "../cards/basic/copper";
import { Curse } from "../cards/basic/curse";
import { Estate } from "../cards/basic/estate";
import { Silver } from "../cards/basic/silver";
import { HeuristicType, CardSelectorCriteria } from "./card_selector_types";

export class DefaultCriteria {
  static trashCardsOptional(): CardSelectorCriteria[] {
    return [
      { cardName: Curse.NAME },
      { cardName: Estate.NAME },
      { cardName: Copper.NAME, doNotSelectIfEconomyBelow: 3 },
    ];
  }

  static discardCardsRequired(): CardSelectorCriteria[] {
    return [
      { heuristicType: HeuristicType.JUNK },
      { heuristicType: HeuristicType.VICTORY },
      { cardName: Copper.NAME },
      { cardName: Silver.NAME },
      { alwaysSelect: true },
    ];
  }
}
