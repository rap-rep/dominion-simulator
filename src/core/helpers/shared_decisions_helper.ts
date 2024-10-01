import { Decision } from "../decisions";
import { CardSelector, HeuristicType } from "../logic/card_selector";
import { DefaultCriteria } from "../logic/default_selection_criteria";
import { Player } from "../player";
import { PlayerHelper } from "./player_helper";

export class SharedDefaultDecisions {
  /*
   * Logic for default decisions that would ordinarily go on a Card,
   * but since cards can share the same Decision requirements, shared implementations go here
   *
   * Decisions are applied by mutating the decision object to include a result value
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
      DefaultCriteria.discardCardsRequired(),
    );
    decision.result = selector.getCardsFromCriteria(
      player.hand,
      0,
      amountToDiscard,
    );
  }

  static discardDecision(player: Player, decision: Decision) {
    const amountToDiscard = decision.amount;

    const selector = new CardSelector(
      player,
      [],
      DefaultCriteria.discardCardsRequired(),
    );
    decision.result = selector.getCardsFromCriteria(
      player.hand,
      0,
      amountToDiscard,
    );
  }

  static exileDiscardDecision(player: Player, decision: Decision) {
    if (!player.exile.has(decision.fromCard.name)) {
      decision.result = false;
      return;
    }

    const dontDiscard = [HeuristicType.JUNK, HeuristicType.VICTORY];
    if (!dontDiscard.includes(decision.fromCard.heuristicType())) {
      decision.result = true;
    }
  }
}
