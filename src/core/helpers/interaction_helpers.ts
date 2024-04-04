import { Card } from "../card";
import { InteractionType, CardType } from "../card_types";
import { Player } from "../player";

export class InteractionHelper {
  static effectiveCostNumber(player: Player, card: Card): number {
    if (!player){
      return 0;
    }
    if (
      card.specificReductionInteraction() ===
      InteractionType.ACTIONS_IN_PLAY_DURING_BUY
    ) {
      let counter = 0;
      for (card of player.inPlay) {
        if (card.types.includes(CardType.ACTION)) {
          counter++;
        }
      }
      return counter;
    } else {
      return 0;
    }
  }
}
