import { Card } from "../card";
import { Game } from "../game";
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
      turn: player.game.turn,
    };
  }

  private static winnerRecord(player: Player, amount: number): EventRecord {
    return {
      playerName: player.name,
      type: EventQueryType.WINS,
      gameNumber: player.game.gameNumber,
      amount: amount,
      turn: player.game.turn,
    };
  }

  static winner(
    currentGame: Game,
    winner: Player | Player[] | undefined,
  ): EventRecord[] {
    const winnerRecords = new Array();
    if (!winner) {
      throw new Error(
        "Invalid state (Game bug): game ended with no winner assigned.",
      );
    }
    if (Array.isArray(winner)) {
      for (const player of [currentGame.p1, currentGame.p2]) {
        winnerRecords.push(this.winnerRecord(player, 0.5));
      }
    } else {
      winnerRecords.push(this.winnerRecord(winner, 1));
    }

    return winnerRecords;
  }

  static vp(player: Player, fromCard: Card, amount: number): EventRecord {
    return {
      playerName: player.name,
      type: EventQueryType.VP,
      gameNumber: player.game.gameNumber,
      amount: amount,
      fromCard: fromCard.name,
      turn: player.game.turn,
    };
  }

  static trash(player: Player, fromCard?: Card | undefined, toCard?: Card | undefined): EventRecord {
    return {
      playerName: player.name,
      type: EventQueryType.TRASH,
      gameNumber: player.game.gameNumber,
      amount: 1,
      fromCard: fromCard?.name,
      toCard: toCard?.name,
      turn: player.game.turn,
    };
  }
}
