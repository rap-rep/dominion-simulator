import { Village } from "@src/core/cards/base/village";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";

describe("Village", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.addCard(new Village());
  game.p1.playActionPhase();
  it("gives a card and two actions", () => {
    expect(game.p1.actions).toBe(2);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(1);
  });
});
