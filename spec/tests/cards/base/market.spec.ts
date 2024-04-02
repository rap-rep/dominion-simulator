import { Market } from "@src/core/cards/base/market";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";

describe("Market", () => {
  const game = new Game();
  game.p1.addCardToHand(new Market());
  game.p1.playActionPhase();
  it("Grants a cantrip coin buy", () => {
    expect(game.p1.inPlay.length).toEqual(1);
    expect(game.p1.inPlay[0].name).toEqual(Market.name);
    expect(game.p1.actions).toBe(1);
    expect(game.p1.coins).toBe(1);
    expect(game.p1.buys).toBe(2);
    expect(PlayerHelper.countHandSize(game.currentPlayer)).toEqual(6);
  });
});
