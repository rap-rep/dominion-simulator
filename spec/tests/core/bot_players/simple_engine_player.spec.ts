import { SimpleEnginePlayer } from "@src/core/bot_players/simple_engine_player";
import { Game } from "@src/core/game";
import { LogLevel, LogMode } from "@src/core/logging/game_log";

describe("A set of games between a simple engine and a default (money) bot", () => {
  let game: Game;
  let wins = 0;
  let losses = 0;
  let turns = 0;
  const SIMS = 1;
  for (let i = 0; i < SIMS; i++) {
    game = new Game({ logMode: LogMode.CONSOLE_LOG, logLevel: LogLevel.DEBUG });
    game.p2 = new SimpleEnginePlayer("SimpleEngine", game);
    game.p1.opponent = game.p2;
    game.p2.opponent = game.p1;
    game.playGame();
    turns += game.turn;
    if (game.winner === game.p2) {
      wins++;
    } else if (game.winner === game.p1) {
      losses++;
    }
  }
  it("averages less than 20 turns", () => {
    expect(turns / SIMS).toBeLessThan(20);
    //expect(wins).toBeGreaterThan(1);
  });
});
