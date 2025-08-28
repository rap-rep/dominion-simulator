import { Moneylender } from "@src/core/cards/base/moneylender";
import { Copper } from "@src/core/cards/basic/copper";
import { Estate } from "@src/core/cards/basic/estate";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { LogLevel, LogMode } from "@src/core/logging/game_log";

describe("Moneylender", () => {
  const game = new Game({
    logMode: LogMode.SILENT,
    logLevel: LogLevel.EXTRA,
    p1cards: [
      [Copper.NAME, 4],
      [Moneylender.NAME, 1],
    ],
  });
  game.p1.playActionPhase();
  it("trashes a copper and grants 3 coins", () => {
    expect(game.p1.inPlay.length).toEqual(1);
    expect(game.p1.inPlay[0].name).toEqual(Moneylender.name);
    expect(game.p1.actions).toBe(0);
    expect(game.p1.coins).toBe(3);
    expect(game.p1.buys).toBe(1);
    expect(game.kingdom.trash.get(Copper.NAME)?.length).toBe(1);
    expect(PlayerHelper.countHandSize(game.currentPlayer)).toEqual(3);
  });
});

describe("Moneylender", () => {
  const game = new Game({
    p1cards: [
      [Estate.NAME, 4],
      [Moneylender.NAME, 1],
    ],
  });
  game.p1.playActionPhase();
  it("doesn't trash a Copper it can't, and gets no coins", () => {
    expect(game.p1.inPlay.length).toEqual(1);
    expect(game.p1.inPlay[0].name).toEqual(Moneylender.name);
    expect(game.p1.actions).toBe(0);
    expect(game.p1.coins).toBe(0);
    expect(game.p1.buys).toBe(1);
    expect(game.kingdom.trash.get(Copper.NAME)).toBe(undefined);
    expect(PlayerHelper.countHandSize(game.currentPlayer)).toEqual(4);
  });
});
