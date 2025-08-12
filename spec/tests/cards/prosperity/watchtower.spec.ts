import { Smithy } from "@src/core/cards/base/smithy";
import { Copper } from "@src/core/cards/basic/copper";
import { Curse } from "@src/core/cards/basic/curse";
import { Watchtower } from "@src/core/cards/prosperity/watchtower";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { EffectResolver } from "@src/core/resolvers/effect_resolver";

describe("Watchtower", () => {
  const game = new Game();
  game.p1.hand = new Map();

  // Put 7 cards in deck (starts with 5), expecting to draw 6
  game.p1.deck.push(new Copper());
  game.p1.deck.push(new Copper());

  game.p1.addCard(new Watchtower());
  game.p1.playActionPhase();
  it("draws six cards from empty hand", () => {
    expect(game.p1.actions).toBe(0);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(6);
  });
});

describe("Watchtower", () => {
  const game = new Game();
  game.p1.addCard(new Watchtower());

  // Put 7 cards in deck (starts with 5), expecting to draw 6
  game.p1.deck.push(new Copper());
  game.p1.deck.push(new Copper());

  game.p1.addCard(new Watchtower());
  game.p1.playActionPhase();
  it("draws one card when played from starting hand of 6", () => {
    expect(game.p1.actions).toBe(0);
    expect(PlayerHelper.countHandSize(game.p1)).toBe(6);
  });
});

describe("Watchtower", () => {
  const game = new Game();
  game.p1.addCard(new Watchtower());

  game.p1.effectResolver.gainCard(game.p1, Curse.NAME);
  it("trashes a gained cursed while in hand", () => {
    expect(game.p1.discard.length).toBe(0);
    expect(game.kingdom.trash.size).toBe(1);
    expect(game.kingdom.trash.get(Curse.NAME)?.pop()?.name).toBe(Curse.NAME);
  });
});
