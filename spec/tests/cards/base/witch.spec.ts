import { Witch } from "@src/core/cards/base/witch";
import { Curse } from "@src/core/cards/basic/curse";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { LogLevel, LogMode } from "@src/core/logging/game_log";

describe("Witch", () => {
  const game = new Game({logMode: LogMode.CONSOLE_LOG, logLevel: LogLevel.INFO});
  game.p1.hand = new Map();
  game.p1.addCard(new Witch());
  game.p1.playActionPhase();
  it("draws two cards", () => {
    expect(game.p1.actions).toBe(0);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(2);
  });

  it("gives a curse", () => {
    expect(game.p2.discard.length).toEqual(1);
  });

});



describe("Witch with an empty Curse pile", () => {
    const game = new Game();
    game.p1.hand = new Map();
    game.p1.addCard(new Witch());

    // empty the curse pile
    for (let i=0; i<10; i++){
        game.kingdom.supplyPiles.get(Curse.NAME)?.pop();
    }

    game.p1.playActionPhase();

    it("doesn't give out a Curse", () => {
      expect(game.p1.actions).toBe(0);
      expect(PlayerHelper.countHandSize(game.p1)).toBe(2);

      expect(game.p2.discard.length).toEqual(0);
    });
  });
