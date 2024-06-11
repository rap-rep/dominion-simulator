import { Dungeon } from "@src/core/cards/adventures/dungeon";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { LogLevel, LogMode } from "@src/core/logging/game_log";

describe("Dungeon", () => {
  const game = new Game({ logMode: LogMode.SILENT, logLevel: LogLevel.INFO });
  game.p1.addCardToHand(new Dungeon());
  game.p1.playActionPhase();
  it("draws and discards two on the first turn correctly", () => {
    expect(game.p1.inPlay.length).toEqual(1);
    expect(game.p1.inPlay[0].name).toEqual(Dungeon.name);
    expect(game.p1.actions).toEqual(1);
    expect(game.p1.buys).toEqual(1);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(5);
    expect(game.p1.discard.length).toBe(2);
  });
});


describe("Dungeon", () => {
    const game = new Game({ logMode: LogMode.CONSOLE_LOG, logLevel: LogLevel.INFO });
    game.p1.addCardToHand(new Dungeon());
    game.p1.playActionPhase();
    game.p1.playCleanupPhase();
    game.p1.playStartTurn();
    it("performs duration discard effect correctly", () => {
      expect(game.p1.inPlay.length).toEqual(1);
      expect(game.p1.inPlay[0].name).toEqual(Dungeon.name);
      expect(game.p1.actions).toEqual(1);
      expect(game.p1.buys).toEqual(1);
      expect(PlayerHelper.countHandSize(game.p1)).toBe(5);
      expect(game.p1.discard.length).toBe(2);
    });
  });