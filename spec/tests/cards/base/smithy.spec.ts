import { Smithy } from "@src/core/cards/base/smithy";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";

describe("Smithy", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.addCardToHand(new Smithy());
  game.p1.playActionPhase();
  it("draws three cards", () => {
    expect(game.p1.actions).toBe(0);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(3);
  });
});
