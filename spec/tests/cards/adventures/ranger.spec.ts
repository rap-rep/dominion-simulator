import { Ranger } from "@src/core/cards/adventures/ranger";
import { Copper } from "@src/core/cards/basic/copper";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";

describe("Ranger", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.addCard(new Ranger());
  game.p1.playActionPhase();
  it("draws no cards on the first play", () => {
    expect(game.p1.actions).toBe(0);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(0);
    expect(game.p1.buys).toBe(2);
  });
});

describe("Two ranger plays", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.actions = 2;
  for (let i = 0; i < 2; i++) {
    game.p1.addCard(new Ranger());
  }
  game.p1.playActionPhase();
  it("draw five cards", () => {
    expect(game.p1.actions).toBe(0);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(5);
    expect(game.p1.buys).toBe(3);
  });
});

describe("Five ranger plays with a large deck and token starting down", () => {
  const game = new Game();
  game.p1.hand = new Map();
  for (let i = 0; i < 30; i++) {
    const copper = new Copper();
    game.p1.addToAllCards(copper);
    game.p1.discard.push(copper);
  }
  game.p1.journeyTokenUp = false;
  game.p1.actions = 10;
  for (let i = 0; i < 5; i++) {
    game.p1.addCard(new Ranger());
  }

  game.p1.playActionPhase();
  it("draws fifteen cards", () => {
    expect(PlayerHelper.countHandSize(game.p1)).toBe(15);
    expect(game.p1.buys).toBe(6);
  });
});
