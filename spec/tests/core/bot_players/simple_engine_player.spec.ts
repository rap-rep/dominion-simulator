import { SimpleEnginePlayer } from "@src/core/bot_players/simple_engine_player";
import { Game } from "@src/core/game";
import { LogLevel, LogMode } from "@src/core/logging/game_log";

describe("A complete game with default board between one simple engine and a money player", () => {
  let game: Game;
  // Uses a loop to allow for easy benchmarking using this
  for (let i = 0; i < 1; i++) {
    game = new Game({ logMode: LogMode.CONSOLE_LOG, logLevel: LogLevel.INFO });
    game.p2 = new SimpleEnginePlayer("SimpleEngine", game);
    game.p1.opponent = game.p2;
    game.p2.opponent = game.p1;
    game.playGame();
  }
  it("ends before turn 25", () => {
    expect(game.turn).toBeLessThan(25);
  });
});
