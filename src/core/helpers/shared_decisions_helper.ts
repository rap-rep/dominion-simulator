import { Card } from "../card";
import { Copper } from "../cards/basic/copper";
import { Silver } from "../cards/basic/silver";
import { Decision } from "../decisions";
import { CardSelector, HeuristicType } from "../logic/card_selector";
import { Player } from "../player";
import { PlayerHelper } from "./player_helper";

export class SharedDecisionsHelper {
  /*
   * Logic for default decisions that would ordinarily go on a Card,
   * but since cards can share the same Decision requirements, shared implementations go here
   */
  static discardToDecision(player: Player, decision: Decision) {
    const discardToAmount = decision.amount;
    if (!discardToAmount) {
      throw new Error(
        "amount to discard down to not specified in the decision",
      );
    }
    const amountToDiscard = Math.max(
      0,
      PlayerHelper.countHandSize(player) - discardToAmount,
    );

    const selector = new CardSelector(
      player,
      [],
      [
        { heuristicType: HeuristicType.JUNK },
        { heuristicType: HeuristicType.VICTORY },
        { cardName: Copper.NAME },
        { cardName: Silver.NAME },
        { alwaysSelect: true },
      ],
    );
    decision.result = selector.getCardsFromCriteria(
      player.hand,
      0,
      amountToDiscard,
    );
  }
}
