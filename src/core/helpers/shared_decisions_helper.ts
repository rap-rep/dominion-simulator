import { CardType } from "../card_types";
import { Copper } from "../cards/basic/copper";
import { Decision, DecisionType } from "../decisions";
import { EffectPlayer } from "../effects";
import { LogLevel } from "../logging/game_log";
import {
  CardSelector,
  CardSelectorCriteria,
  HeuristicType,
} from "../logic/card_selector";
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

  static trashCopper(player: Player, decision: Decision) {
    // always says yes to trashing one copper
    const selector = new CardSelector(player, [{ cardName: Copper.NAME }]);
    decision.result = selector.getCardsFromCriteria(player.hand, 1);
  }

  static topdeckDecision(player: Player, decision: Decision) {
    const amountToTopdeck = decision.amount;

    var selectFromPlayer = player;
    var criteria: CardSelectorCriteria[] =
      DefaultCriteria.discardCardsRequired();

    if (decision.decisionType === DecisionType.TOPDECK_VICTORY) {
      criteria = [{ type: CardType.VICTORY }];
    }

    const selector = new CardSelector(selectFromPlayer, [], criteria);
    decision.result = selector.getCardsFromCriteria(
      selectFromPlayer.hand,
      0,
      amountToTopdeck,
      false,
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
