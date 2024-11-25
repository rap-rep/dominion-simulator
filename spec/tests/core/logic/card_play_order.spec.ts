import { Smithy } from "@src/core/cards/base/smithy";
import { Village } from "@src/core/cards/base/village";
import { Game } from "@src/core/game";
import { LogLevel, LogMode } from "@src/core/logging/game_log";

describe("Village and Smithy in hand plays in correct order", () => {
  const game = new Game({
    logLevel: LogLevel.INFO,
    logMode: LogMode.SILENT,
  });

  game.currentPlayer.addCardToHand(new Village(), true);
  game.currentPlayer.addCardToHand(new Smithy(), true);

  game.currentPlayer.playActionPhase();

  it("by playing village first", () => {
    expect(game.currentPlayer.inPlay.length).toBe(2);
    expect(game.currentPlayer.inPlay[0]?.name).toBe(Village.NAME);
    expect(game.currentPlayer.inPlay[1]?.name).toBe(Smithy.NAME);
  });
});

describe("2 Villages, 2 Smithies, and a Workshop", () => {
  const game = new Game({
    logLevel: LogLevel.INFO,
    logMode: LogMode.SILENT,
    p1cards: [
      ["Village", 2],
      ["Smithy", 2],
      ["Workshop", 1],
    ],
  });

  game.currentPlayer.playActionPhase();
  game.currentPlayer.playTreasurePhase();

  it("gain and plays a silver", () => {
    expect(game.currentPlayer.inPlay.length).toBe(6);
  });
});
