import { Workshop } from "@src/core/cards/base/workshop";
import { Game } from "@src/core/game";

describe("Workshop", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.addCard(new Workshop());
  game.p1.playActionPhase();
  it("gains a card costing up to 4", () => {
    expect(game.p1.discard.length).toEqual(1);
    expect(game.p1.discard[0].effectiveCost(0)).toBeLessThanOrEqual(4);
  });

  it("is a terminal action", () => {
    expect(game.currentPlayer.inPlay.length).toEqual(1);
    expect(game.currentPlayer.inPlay[0].name).toEqual(Workshop.name);
    expect(game.currentPlayer.actions).toBe(0);
    expect(game.currentPlayer.coins).toBe(0);
  });
});
