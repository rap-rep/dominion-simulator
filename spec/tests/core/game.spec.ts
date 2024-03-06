import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/default_decisions";

describe("Game has a valid starting state", () => {
  const game = new Game();
  it("Should have both players draw a hand of 5 cards", () => {
    expect(PlayerHelper.countHandSize(game.p1)).toBe(5);
    expect(PlayerHelper.countHandSize(game.p2)).toBe(5);

    expect(game.p1.deck.length).toBe(5);
    expect(game.p2.deck.length).toBe(5);
  });
});

describe("A complete game with default rules", () => {
  let game: Game;
  // Uses a loop to allow for easy benchmarking using this
  for (let i = 0; i < 1; i++) {
    game = new Game();
    game.playGame();
  }
  it("ends before turn 22", () => {
    expect(game.turn).toBeLessThan(22);
  });
});
