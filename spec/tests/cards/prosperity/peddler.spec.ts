import { Peddler } from "@src/core/cards/prosperity/peddler";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";

describe("Peddler", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.addCard(new Peddler());
  game.currentPlayer.playActionPhase();
  it("Grants a cantrip and a coin", () => {
    expect(game.currentPlayer.inPlay.length).toEqual(1);
    expect(game.currentPlayer.inPlay[0].name).toEqual(Peddler.name);
    expect(game.currentPlayer.actions).toBe(1);
    expect(game.currentPlayer.coins).toBe(1);
    expect(PlayerHelper.countHandSize(game.currentPlayer)).toEqual(1);
  });
});

describe("Peddler cost", () => {
  const game = new Game();
  game.p1.hand = new Map();
  const peddler = new Peddler();
  game.p1.addCard(peddler);
  game.currentPlayer.playActionPhase();
  it("is reduced by 2 per action in play during the buy phase", () => {
    expect(peddler.effectiveCost(0, 1)).toBe(6);
    expect(peddler.effectiveCost(1, 2)).toBe(3);
    expect(peddler.effectiveCost(0, 5)).toBe(0);
  });
});
