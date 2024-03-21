import { CardType } from "@src/core/card_types";
import { Village } from "@src/core/cards/base/village";
import { Copper } from "@src/core/cards/basic/copper";
import { Estate } from "@src/core/cards/basic/estate";
import { Province } from "@src/core/cards/basic/province";
import { Silver } from "@src/core/cards/basic/silver";
import { EffectType } from "@src/core/effects";
import { Game } from "@src/core/game";

describe("Sanity check the kingdom setup ", () => {
  const game = new Game();
  const copper_pile = game.kingdom.supplyPiles.get(Copper.NAME);
  let top_copper: Copper | undefined;
  if (copper_pile && copper_pile.length > 0) {
    top_copper = copper_pile[0];
  }
  let second_copper: Copper | undefined;
  if (copper_pile && copper_pile.length > 1) {
    second_copper = copper_pile[1];
  }

  it("should have 46 copper", () => {
    expect(game.kingdom.supplyPiles.get(Copper.NAME)?.length).toBe(46);
    expect(top_copper?.playGraph().getStartNode()?.node.effectType).toBe(
      EffectType.PLUS_COIN,
    );
  });

  it("should produce cards that are not identical objects (reference not shared)", () => {
    expect(top_copper).toBeDefined();
    expect(Object.is(top_copper, second_copper)).toBe(false);
  });

  describe("Province pile empty", () => {
    const game = new Game();
    let provinces = game.kingdom.supplyPiles.get(Province.NAME);
    while (provinces && provinces.length > 0) {
      provinces.pop();
    }

    console.log(game.kingdom.supplyPiles.get(Province.NAME));

    it("ends the game", () => {
      expect(game.kingdom.gameOver()).toBe(true);
    });
  });

  describe("Three piles being empty", () => {
    const game = new Game();
    let copper = game.kingdom.supplyPiles.get(Copper.NAME);
    let silver = game.kingdom.supplyPiles.get(Silver.NAME);
    let estate = game.kingdom.supplyPiles.get(Estate.NAME);

    while (copper && copper.length > 0) {
      copper.pop();
    }
    while (silver && silver.length > 0) {
      silver.pop();
    }
    while (estate && estate.length > 0) {
      estate.pop();
    }

    it("ends the game", () => {
      expect(game.kingdom.gameOver()).toBe(true);
    });
  });

  describe("Two piles being empty", () => {
    const game = new Game();
    let copper = game.kingdom.supplyPiles.get(Copper.NAME);
    let silver = game.kingdom.supplyPiles.get(Silver.NAME);

    while (copper && copper.length > 0) {
      copper.pop();
    }
    while (silver && silver.length > 0) {
      silver.pop();
    }

    it("does not end the game", () => {
      expect(game.kingdom.gameOver()).toBe(false);
    });
  });

  describe("Default setup includes", () => {
    const game = new Game();
    const topVillage = game.kingdom.getTopOrError(Village.NAME);
    it("a pile of Villages", () => {
      expect(game.kingdom.supplyPiles.get(Village.NAME)?.length).toBe(10);
      expect(topVillage.types).toEqual([CardType.ACTION]);
    });
  });
});
