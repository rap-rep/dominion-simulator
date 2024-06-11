import { Warehouse } from "@src/core/cards/base/warehouse";
import { Estate } from "@src/core/cards/basic/estate";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { LogLevel, LogMode } from "@src/core/logging/game_log";

describe("Warehouse", () => {
  const game = new Game({ logMode: LogMode.SILENT, logLevel: LogLevel.INFO });
  game.p1.addCardToHand(new Warehouse());
  game.p1.playActionPhase();
  it("draws and discards three correctly", () => {
    expect(game.p1.inPlay.length).toEqual(1);
    expect(game.p1.inPlay[0].name).toEqual(Warehouse.name);
    expect(game.p1.actions).toEqual(1);
    expect(game.p1.buys).toEqual(1);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(5);
    expect(game.p1.discard.length).toBe(3);
    expect(game.p1.hand.get(Estate.NAME)).toBeUndefined();
  });
});
