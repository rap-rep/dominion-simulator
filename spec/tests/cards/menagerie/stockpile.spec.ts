import { Stockpile } from "@src/core/cards/menagerie/stockpile";
import { Game } from "@src/core/game";
import { LogLevel, LogMode } from "@src/core/logging/game_log";

describe("Stockpile", () => {
  const game = new Game({ logLevel: LogLevel.INFO, logMode: LogMode.SILENT });
  game.p1.hand = new Map();
  game.p1.addCard(new Stockpile());
  game.p1.playTreasurePhase();
  it("should grant the player three coins and a buy, be exiled", () => {
    expect(game.p1.coins).toEqual(3);
    expect(game.p1.buys).toEqual(2);
    expect(game.p1.inPlay.length).toEqual(0);
    expect(game.p1.exile.get(Stockpile.NAME)?.length).toEqual(1);
  });
});

describe("Stockpile", () => {
  const game = new Game({ logLevel: LogLevel.INFO, logMode: LogMode.SILENT });
  game.p1.hand = new Map();
  game.p1.exile.set(Stockpile.NAME, [new Stockpile()]);

  game.p1.effectResolver.gainCard(game.p1, Stockpile.NAME);
  it("when bought should discard already exiled Stockpiles", () => {
    expect(game.p1.discard.length).toBe(2);
    expect(game.p1.discard[0]?.name).toBe(Stockpile.NAME);
  });
});
