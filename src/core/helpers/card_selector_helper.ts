import { Card } from "../card";
import { Player } from "../player";

export class CardSelectorHelper {
  static countTotalEconomy(player: Player) {
    let tally = 0;
    for (const card of player.allCardsList) {
      tally += card.economyHeuristicValue();
    }
    return tally;
  }

  static sortByValueFnDraw(card: Card, player: Player){
    return card.drawHeuristicValue(player);
  }

}
