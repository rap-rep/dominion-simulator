import { Chapel } from "@src/core/cards/base/chapel";
import { Smithy } from "@src/core/cards/base/smithy";
import { Village } from "@src/core/cards/base/village";
import { Copper } from "@src/core/cards/basic/copper";
import { Estate } from "@src/core/cards/basic/estate";
import { Game } from "@src/core/game";
import { LogLevel, LogMode } from "@src/core/logging/game_log";
import {
  CardSelector,
  CardSelectorCriteria,
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector";
import { DefaultCriteria } from "@src/core/logic/default_selection_criteria";

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

describe("Card selector with default discard logic", () => {
  const game = new Game({
    logLevel: LogLevel.EXTREME,
    logMode: LogMode.SILENT,
  });
  const forcedEstate = new Estate();
  game.p1.addToAllCards(forcedEstate);
  game.p1.addCardToHand(forcedEstate);

  const selector = new CardSelector(
    game.currentPlayer,
    [],
    DefaultCriteria.discardCardsRequired(),
  );
  const result = selector.getCardsFromCriteria(game.currentPlayer.hand, 0, 1);

  it("selects Estate when Estate and Copper are available", () => {
    expect(result[0].name).toEqual(Estate.NAME);
  });
});

describe("Card selector with multiple villages and a draw card", () => {
  const game = new Game({
    logLevel: LogLevel.EXTREME,
    logMode: LogMode.CONSOLE_LOG,
    p1cards: [["Village", 2], ["Smithy", 1], ["Copper", 2]],
  });

  game.p1.actions = 1;

  for (let i=0; i<10; i++){
    const copper = new Copper();
    game.p1.addToAllCards(copper);
    game.p1.deck.push(copper);
  }

  const selector = new CardSelector(
    game.currentPlayer,
    [],
    DefaultCriteria.playTurnDefault(),
  );
  const result = selector.getCardsFromCriteria(game.currentPlayer.hand, 0, 1);

  game.p1.actions = 2;
  const result2 = selector.getCardsFromCriteria(game.currentPlayer.hand, 0, 1);

  it("selects correct card based on number of actions available", () => {
    expect(result[0].name).toEqual(Village.NAME);
    expect(result2[0].name).toEqual(Smithy.NAME);
  });



});
