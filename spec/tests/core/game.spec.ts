import { Province } from "@src/core/cards/basic/province";
import { Game, GameConfig } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";

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
  game = new Game();
  game.playGame();
  it("ends before turn 22 with an empty Province pile", () => {
    expect(game.turn).toBeLessThan(22);
    expect(game.kingdom.supplyPiles.get(Province.NAME)).toBeDefined();
    expect(game.kingdom.supplyPiles.get(Province.NAME)?.length).toEqual(0);
  });
});
