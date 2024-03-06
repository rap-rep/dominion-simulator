import { CardNameMap } from "../cards/name_map";
import { Game } from "../game";
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
      return card.effectiveCost(
        player.game.kingdom.globalCostReduction,
        InteractionHelper.effectiveCostNumber(player.game.currentPlayer, card),
      );
    } else {
      // there is no card to gain from a supply pile
      return 9999; // XXX HACK: return a number large enough to make the >= comparison fail
    }
  }
}
