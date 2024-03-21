import { Card } from "../card";
import { Player } from "../player";
import { EventQueryType, EventRecord } from "./event_query";

export class EventRecordBuilder {
  static draw(player: Player, fromCard: Card, cardDrawn: Card): EventRecord {
    return {
      playerName: player.name,
      type: EventQueryType.DRAW_CARD,
      gameNumber: player.game.gameNumber,
      amount: 1,
      fromCard: fromCard.name,
      toCard: cardDrawn.name,
    };
  }
}
