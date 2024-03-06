import { Copper } from "@src/core/cards/basic/copper";
import { Wharf } from "@src/core/cards/seaside/wharf";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/default_decisions";

describe("Wharf", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.addCardToHand(new Wharf());
  game.p1.playActionPhase();
  it("draws two cards and gives a buy", () => {
    expect(game.p1.inPlay?.[0].name).toEqual(Wharf.NAME);
    expect(game.p1.actions).toBe(0);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(2);
    expect(game.p1.buys).toBe(2);
  });
});

describe("Wharf", () => {
  const game = new Game();
  game.p1.hand = new Map();
  for (let i = 0; i < 10; i++) {
    game.p1.topdeck(new Copper());
  }
  game.p1.addCardToHand(new Wharf());
  game.p1.playActionPhase();
  game.p1.playCleanupPhase();
  game.turn++;
  game.p1.startTurn();
  game.p1.playActionPhase();

  it("draws two cards and gives a buy on the duration turn", () => {
    expect(game.p1.inPlay?.[0].name).toEqual(Wharf.NAME);
    expect(game.p1.actions).toBe(1);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(7);
    expect(game.p1.buys).toBe(2);
  });
});
