import { Chapel } from "@src/core/cards/base/chapel";
import { Gold } from "@src/core/cards/basic/gold";
import { Game } from "@src/core/game";
import { CardSelectorHelper } from "@src/core/helpers/card_selector_helper";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { LogLevel, LogMode } from "@src/core/logging/game_log";

describe("Chapel", () => {
  const game = new Game();
  game.p1.addCardToHand(new Chapel());
  game.p1.playActionPhase();
  it("trashes 4 cards on t1 conditions", () => {
    expect(game.p1.inPlay.length).toEqual(1);
    expect(game.p1.inPlay[0].name).toEqual(Chapel.name);
    expect(game.p1.actions).toBe(0);
    expect(game.p1.coins).toBe(0);
    expect(game.p1.buys).toBe(1);
    expect(PlayerHelper.countHandSize(game.currentPlayer)).toEqual(1);
    expect(game.kingdom.getTotalTrashSize()).toBe(4);
  });
});

describe("Chapel over 10 turns", () => {
  const game = new Game({
    logMode: LogMode.SILENT,
    logLevel: LogLevel.INFO,
  });
  const chapel = new Chapel();
  game.p1.addCardToHand(chapel, true);

  game.playGame(10);

  it("doesn't over-trash the deck below ability to buy Silver, so gains a Gold", () => {
    expect(game.kingdom.getTotalTrashSize()).toBeGreaterThan(7);
    expect(
      CardSelectorHelper.countTotalEconomy(game.p1),
    ).toBeGreaterThanOrEqual(3);
    expect(game.p1.allCardsMap.get(Gold.NAME)?.length).toBeGreaterThanOrEqual(
      1,
    );
  });
});
