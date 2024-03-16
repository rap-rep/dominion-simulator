import { Card } from "../card";
import { InteractionHelper } from "../helpers/interaction_helpers";
import { Player } from "../player";

export class MetricHelper {
  static effectiveCostOf(player: Player, cardName: string): number {
    const pile = player.game.kingdom.supplyPiles.get(cardName);
    if (pile && pile.length > 0) {
      const card = pile[0];
      const effectiveCost = card.effectiveCost(
        player.game.kingdom.globalCostReduction,
        InteractionHelper.effectiveCostNumber(player.game.currentPlayer, card),
      );
      return effectiveCost;
    } else {
      // there is no such card to gain from a supply pile
      return 9999; // XXX HACK: return a number large enough to make the >= affordability comparison fail
    }
  }

  static effectiveCostOfCard(player: Player, card: Card): number {
    // needed to calculated effective cost on an already gained card
    const effectiveCost = card.effectiveCost(
      player.game.kingdom.globalCostReduction,
      InteractionHelper.effectiveCostNumber(player.game.currentPlayer, card),
    );
    return effectiveCost;
  }
}
