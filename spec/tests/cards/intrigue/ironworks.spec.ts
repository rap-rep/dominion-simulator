import { Estate } from "@src/core/cards/basic/estate";
import { Silver } from "@src/core/cards/basic/silver";
import { Ironworks } from "@src/core/cards/intrigue/ironworks";
import { Decision } from "@src/core/decisions";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/default_decisions";

describe("Ironworks gains a treasure", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.addCardToHand(new Ironworks());
  game.p1.playActionPhase();
  it(", a silver with default buy rules", () => {
    expect(game.p1.discard.length).toEqual(1);
    expect(game.p1.discard[0].effectiveCost(0)).toBeLessThanOrEqual(4);
    expect(game.p1.discard[0].name).toEqual(Silver.NAME);
  });

  it("and receives the coin reward`", () => {
    expect(game.currentPlayer.inPlay.length).toEqual(1);
    expect(game.currentPlayer.inPlay[0].name).toEqual(Ironworks.name);
    expect(game.currentPlayer.actions).toBe(0);
    expect(game.currentPlayer.coins).toBe(1);
    expect(PlayerHelper.countHandSize(game.currentPlayer)).toBe(0);
  });
});

describe("Ironworks gains an Estate", () => {
  // based on default buy rule for late turn estates
  const game = new Game();
  game.turn = 20;
  game.p1.hand = new Map();
  game.p1.addCardToHand(new Ironworks());
  game.p1.playActionPhase();
  it("successfully", () => {
    expect(game.p1.discard.length).toEqual(1);
    expect(game.p1.discard[0].name).toEqual(Estate.NAME);
  });

  it("and draws a card", () => {
    expect(game.currentPlayer.inPlay.length).toEqual(1);
    expect(game.currentPlayer.inPlay[0].name).toEqual(Ironworks.name);
    expect(game.currentPlayer.actions).toBe(0);
    expect(game.currentPlayer.coins).toBe(0);
    expect(PlayerHelper.countHandSize(game.currentPlayer)).toBe(1);
  });
});
