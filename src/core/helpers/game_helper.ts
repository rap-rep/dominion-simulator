import { Game } from "../game";
import { PlayerHelper } from "./player_helper";

export class GameHelper {
  static recordVPEvents(game: Game) {
    for (const player of [game.p1, game.p2]) {
      for (const record of PlayerHelper.getVPrecords(player)) {
        game.eventQueryManager.recordEvent(record);
      }
    }
  }
}
