import { Copper } from "@src/core/cards/basic/copper";
import { Game } from "@src/core/game";

describe("Copper", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.addCard(new Copper());
  game.p1.playTreasurePhase();
  it("should grant the player a coin", () => {
    expect(game.p1.coins).toEqual(1);
  });
});
