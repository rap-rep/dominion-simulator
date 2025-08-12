import { Horse } from "@src/core/cards/menagerie/horse";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";

describe("Horse", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.addCard(new Horse());
  game.p1.playActionPhase();
  it("draws two cards and an action", () => {
    expect(game.p1.actions).toBe(1);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(2);
  });

  it("is returned to it's pile", () => {
    expect(game.p1.inPlay.length).toEqual(0);
    expect(game.kingdom.nonSupplyPiles.get(Horse.NAME)?.length).toEqual(31);
  });
});
