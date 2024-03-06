import { SimpleEnginePlayer } from "@src/core/bot_players/simple_engine_player";
import { Game } from "@src/core/game";

describe("A complete game with default board between two simple engine players", () => {
  let game: Game;
  // Uses a loop to allow for easy benchmarking using this
  for (let i = 0; i < 1; i++) {
    game = new Game();
    game.p1 = new SimpleEnginePlayer("SimpleEngine", game);
    game.p2 = new SimpleEnginePlayer("SimpleEngine", game);
    game.playGame();
  }
  it("ends before turn 25", () => {
    expect(game.turn).toBeLessThan(25);
  });
});
