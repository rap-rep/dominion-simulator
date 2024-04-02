import { Chapel } from "@src/core/cards/base/chapel";
import { Copper } from "@src/core/cards/basic/copper";
import { Estate } from "@src/core/cards/basic/estate";
import { Game } from "@src/core/game";
import {
  CardSelector,
  CardSelectorCriteria,
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector";

describe("A single optional card selector", () => {
  const game = new Game();
  game.currentPlayer.hand = new Map();
  game.currentPlayer.addCardToHand(new Chapel());

  const criteria: CardSelectorCriteria = {
    cardName: undefined,
    terminalType: undefined,
    heuristicType: HeuristicType.TRASHER,
  };
  const selector = new CardSelector(game.currentPlayer, [criteria]);

  const result = selector.getCardFromCriteria(
    game.currentPlayer.hand,
    selector.criteriaList,
  );

  it("selects a trasher when asked for only that and one is present", () => {
    expect(result?.name).toEqual(Chapel.NAME);
  });
});

describe("A single optional card selector", () => {
  const game = new Game();
  game.currentPlayer.hand = new Map();
  game.currentPlayer.addCardToHand(new Chapel());

  const criteria: CardSelectorCriteria = {
    cardName: undefined,
    terminalType: TerminalType.TERMINAL,
    heuristicType: HeuristicType.TRASHER,
  };
  const selector = new CardSelector(game.currentPlayer, [criteria]);

  const result = selector.getCardFromCriteria(
    game.currentPlayer.hand,
    selector.criteriaList,
  );

  it("selects a terminal trasher when asked for only that and one is present", () => {
    expect(result?.name).toEqual(Chapel.NAME);
  });
});

describe("A single optional card selector", () => {
  const game = new Game();
  game.currentPlayer.hand = new Map();
  const estate = new Estate();
  game.currentPlayer.addCardToHand(estate);

  const criteria: CardSelectorCriteria = {
    cardName: Estate.NAME,
  };
  const selector = new CardSelector(game.currentPlayer, [criteria]);

  const result = selector.getCardFromCriteria(
    game.currentPlayer.hand,
    selector.criteriaList,
    [estate],
  );

  it("skips an already selected Estate", () => {
    expect(result).toBeUndefined();
  });
});

describe("A single optional card selector", () => {
  const game = new Game();
  game.currentPlayer.hand = new Map();
  const estate = new Estate();
  const estate2 = new Estate();
  game.currentPlayer.addCardToHand(estate);
  game.currentPlayer.addCardToHand(estate2);

  const criteria: CardSelectorCriteria = {
    cardName: Estate.NAME,
  };
  const selector = new CardSelector(game.currentPlayer, [criteria]);

  const result = selector.getCardFromCriteria(
    game.currentPlayer.hand,
    selector.criteriaList,
    [estate],
  );

  it("selects a second Estate (but not an already selected first one)", () => {
    expect(Object.is(result, estate)).toBeFalse();
    expect(Object.is(result, estate2)).toBeTrue();
  });
});

describe("A multiple card selector selects two Estates", () => {
  const game = new Game();
  game.currentPlayer.hand = new Map();
  const estate = new Estate();
  const estate2 = new Estate();
  game.currentPlayer.addCardToHand(estate);
  game.currentPlayer.addCardToHand(estate2);

  const criteria: CardSelectorCriteria = {
    cardName: Estate.NAME,
  };
  const selector = new CardSelector(game.currentPlayer, [criteria]);

  const result = selector.getCardsFromCriteria(game.currentPlayer.hand, 2);

  it("selects a second Estate (but not an already selected first one)", () => {
    expect(result.length).toBe(2);
    expect(
      result
        .map((u) => {
          return u.name;
        })
        .join(","),
    ).toBe("Estate,Estate");
    expect(Object.is(result[0], estate)).toBeTrue();
    expect(Object.is(result[1], estate2)).toBeTrue();
  });
});

describe("Card selector", () => {
  const game = new Game();

  const criteria1: CardSelectorCriteria = {
    cardName: Estate.NAME,
  };
  const criteria2: CardSelectorCriteria = {
    cardName: Copper.NAME,
    doNotSelectIfEconomyBelow: 7,
  };
  const selector = new CardSelector(game.currentPlayer, [criteria1, criteria2]);
  const result = selector.getCardsFromCriteria(game.currentPlayer.hand, 4);

  const estatesInHand = game.currentPlayer.hand.get(Estate.NAME)?.length || 0;

  it("only trashes Estates when trashing Copper would lower economy too much", () => {
    expect(estatesInHand).toEqual(result.length);
  });
});
