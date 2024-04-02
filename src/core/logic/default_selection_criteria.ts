import { Copper } from "../cards/basic/copper";
import { Curse } from "../cards/basic/curse";
import { Estate } from "../cards/basic/estate";
import { CardSelectorCriteria } from "./card_selector";

export class DefaultCriteria {
  static trashCardsOptional(): CardSelectorCriteria[] {
    return [
      { cardName: Curse.NAME },
      { cardName: Estate.NAME },
      { cardName: Copper.NAME, doNotSelectIfEconomyBelow: 3 },
    ];
  }
}
