import { Bureaucrat } from "@src/core/cards/base/bureaucrat";
import { Copper } from "@src/core/cards/basic/copper";
import { Estate } from "@src/core/cards/basic/estate";
import { Silver } from "@src/core/cards/basic/silver";
import { GainLocation } from "@src/core/effects";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";

describe("Bureaucrat", () => {
  const game = new Game();
  game.p1.addCard(new Bureaucrat());
  game.p1.playActionPhase();
  it("gains a silver to the top of the deck", () => {
    expect(game.p1.inPlay.length).toEqual(1);
    expect(game.p1.inPlay[0].name).toEqual(Bureaucrat.name);

    expect(game.p1.coins).toEqual(0);
    expect(game.p1.actions).toEqual(0);
    expect(game.p1.buys).toEqual(1);

    expect(game.p1.deck.pop()?.name).toEqual(Silver.NAME);
  });
});

describe("Bureaucrat", () => {
  const game = new Game({
    p1cards: [
      [Estate.NAME, 1],
      [Copper.NAME, 3],
    ],
    p2cards: [
      [Estate.NAME, 1],
      [Copper.NAME, 4],
    ],
  });
  game.p1.addCard(new Bureaucrat(), true, GainLocation.HAND);
  game.p1.playActionPhase();
  it("forces a topdecked Victory card", () => {
    expect(PlayerHelper.countHandSize(game.p1)).toBe(4); // attack does not affect own handsize
    expect(PlayerHelper.countHandSize(game.p1)).toBe(4); // attack does affect opponent handsize

    expect(PlayerHelper.countHandSize(game.p2)).toBe(4);
    expect(game.p2.deck.pop()?.name).toEqual(Estate.name);
  });
});

describe("Bureaucrat", () => {
  const game = new Game({
    p1cards: [
      [Estate.NAME, 1],
      [Copper.NAME, 3],
    ],
    p2cards: [[Copper.NAME, 4]],
  });
  game.p1.addCard(new Bureaucrat(), true, GainLocation.HAND);
  game.p1.playActionPhase();
  it("skips attack if no victory cards", () => {
    expect(PlayerHelper.countHandSize(game.p1)).toBe(4); // attack does not affect own handsize
    expect(PlayerHelper.countHandSize(game.p1)).toBe(4); // attack does not affect opponent handsize
  });
});
