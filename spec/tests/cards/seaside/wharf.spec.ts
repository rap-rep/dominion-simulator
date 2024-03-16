import { DurationPhase } from "@src/core/card_types";
import { Copper } from "@src/core/cards/basic/copper";
import { Wharf } from "@src/core/cards/seaside/wharf";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { LogLevel } from "@src/core/logging/game_log";

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
  for (let i = 0; i < 15; i++) {
    game.p1.topdeck(new Copper());
  }
  const originalWharf = new Wharf();
  game.p1.addCardToHand(originalWharf);
  game.p1.playActionPhase();
  game.p1.playCleanupPhase();
  game.turn++;
  game.p1.startTurn();

  it("draws two cards and gives a buy on the duration turn", () => {
    expect(game.p1.inPlay?.[0]?.name).toEqual(Wharf.NAME);
    expect(game.p1.actions).toBe(1);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(7);
    expect(game.p1.buys).toBe(2);
  });
});
describe("Wharf", () => {
  const game = new Game();
  game.p1.hand = new Map();
  for (let i = 0; i < 15; i++) {
    game.p1.topdeck(new Copper());
  }
  game.p1.addCardToHand(new Wharf());
  game.p1.playActionPhase();
  game.p1.playCleanupPhase();

  it("remains in play after clean up", () => {
    expect(game.p1.inPlay?.[0]?.name).toEqual(Wharf.NAME);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(5);
  });
});

describe("Wharf", () => {
  const game = new Game();
  game.p1.hand = new Map();
  for (let i = 0; i < 15; i++) {
    game.p1.topdeck(new Copper());
  }
  const originalWharf = new Wharf();
  game.p1.addCardToHand(originalWharf);
  game.p1.playActionPhase();
  game.p1.playCleanupPhase();
  game.turn++;
  game.p1.startTurn();
  game.p1.playCleanupPhase();

  it("is discarded and ready to be played again after the duration turn", () => {
    expect(game.p1.inPlay.length).toEqual(0);
    expect(originalWharf.durationPhase).toBe(DurationPhase.REMAINS_IN_PLAY);
  });
});
