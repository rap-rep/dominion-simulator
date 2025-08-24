import { Copper } from "../cards/basic/copper";
import { Curse } from "../cards/basic/curse";
import { Estate } from "../cards/basic/estate";
import { Silver } from "../cards/basic/silver";
import { CardSelectorHelper } from "../helpers/card_selector_helper";
import {
  HeuristicType,
  CardSelectorCriteria,
  TerminalType,
} from "./card_selector_types";

export class DefaultCriteria {
  static trashCardsOptional(): CardSelectorCriteria[] {
    return [
      { cardName: Curse.NAME },
      { cardName: Estate.NAME },
      { cardName: Copper.NAME, doNotSelectIfEconomyBelow: 3 },
    ];
  }

  static playTurnDefault(): CardSelectorCriteria[] {
    return [
      {
        heuristicType: HeuristicType.FROM_DECK_SIFTER,
        terminalType: TerminalType.NONTERMINAL,
      },
      {
        heuristicType: HeuristicType.DRAW,
        terminalType: TerminalType.NONTERMINAL,
        drawCriteria: { atLeastOne: true },
      },
      { heuristicType: HeuristicType.VILLAGE },
      { heuristicType: HeuristicType.CANTRIP },
      {
        heuristicType: HeuristicType.DRAW,
        terminalType: TerminalType.TERMINAL,
        actionsGE: 2,
        drawCriteria: { atLeastOne: true },
        sortByValueFn: CardSelectorHelper.sortByValueFnDraw,
      },
      {
        heuristicType: HeuristicType.DRAW_TO_X,
        terminalType: TerminalType.TERMINAL,
        actionsGE: 2,
        drawCriteria: { atLeastOne: true },
      }, // TODO something much more elegant for dtx
      {
        heuristicType: HeuristicType.PAYLOAD_GAINER,
        terminalType: TerminalType.NONTERMINAL,
      },
      {
        heuristicType: HeuristicType.PAYLOAD_COINS,
        terminalType: TerminalType.NONTERMINAL,
      },
      { heuristicType: HeuristicType.FROM_DECK_SIFTER },
      { heuristicType: HeuristicType.FROM_HAND_SIFTER },
      { heuristicType: HeuristicType.TRASHER },
      {
        heuristicType: HeuristicType.PAYLOAD_GAINER,
        terminalType: TerminalType.TERMINAL,
      },
      {
        heuristicType: HeuristicType.PAYLOAD_COINS,
        terminalType: TerminalType.TERMINAL,
      },
      {
        heuristicType: HeuristicType.DRAW,
        sortByValueFn: CardSelectorHelper.sortByValueFnDraw,
      },
      { heuristicType: HeuristicType.DRAW_TO_X },
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
