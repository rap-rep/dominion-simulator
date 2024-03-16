import { Village } from "@src/core/cards/base/village";
import { WorkersVillage } from "@src/core/cards/prosperity/workers_village";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";

describe("Village", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.addCardToHand(new WorkersVillage());
  game.p1.playActionPhase();
  it("gives a card, two actions, a buy", () => {
    expect(game.p1.actions).toBe(2);
    expect(game.p1.buys).toBe(2);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(1);
  });
});
