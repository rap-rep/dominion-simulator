import { FishingVillage } from "@src/core/cards/seaside/fishing_village";
import { Game } from "@src/core/game";
import { LogLevel, LogMode } from "@src/core/logging/game_log";



describe("Fishing Village played normally", () => {
    const game = new Game({logLevel: LogLevel.INFO, logMode: LogMode.SILENT, p1cards: []});
  
    const fvill = new FishingVillage();
    game.p1.addCardToHand(fvill, true);
  
    game.p1.playActionPhase();

    const actions = game.p1.actions;
    const coins = game.p1.coins;

    game.p1.playCleanupPhase();

    game.p1.playStartTurn();
    const nextTurnActions = game.p1.actions;
    const nextTurnCoins = game.p1.coins;
  
    it("gives a coin and an action and isn't cleaned up", () => {
      expect(fvill).toBeDefined();
      expect(actions).toBe(2);
      expect(coins).toBe(1);
      expect(game.p1.hand.size).toBe(0);
      expect(game.p1.inPlay.length).toBe(1);

      expect(nextTurnActions).toBe(2);
      expect(nextTurnCoins).toBe(1);
    });
  });