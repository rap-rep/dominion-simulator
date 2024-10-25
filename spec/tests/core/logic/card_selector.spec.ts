import { Ranger } from "@src/core/cards/adventures/ranger";
import { Chapel } from "@src/core/cards/base/chapel";
import { Laboratory } from "@src/core/cards/base/laboratory";
import { Smithy } from "@src/core/cards/base/smithy";
import { Village } from "@src/core/cards/base/village";
import { Workshop } from "@src/core/cards/base/workshop";
import { Copper } from "@src/core/cards/basic/copper";
import { Estate } from "@src/core/cards/basic/estate";
import { Ironworks } from "@src/core/cards/intrigue/ironworks";
import { Game } from "@src/core/game";
import { LogLevel, LogMode } from "@src/core/logging/game_log";
import {
  CardSelector,
  CardSelectorCriteria,
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector";
import { SelectorDrawCriteria } from "@src/core/logic/card_selector_types";
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

describe("Card selector with a draw card and a payload card", () => {
  const game = new Game({
    logLevel: LogLevel.EXTREME,
    logMode: LogMode.SILENT,
    p1cards: [["Smithy", 1], ["Workshop", 1], ["Copper", 3]],
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
    expect(result[0].name).toEqual(Workshop.NAME);
    expect(result2[0].name).toEqual(Smithy.NAME);
  });



});

describe("Card selector with draw conditions to play a gainer if deck is drawn", () => {
  const game = new Game({
    logLevel: LogLevel.EXTREME,
    logMode: LogMode.SILENT,
    p1cards: [["Laboratory", 1], ["Ironworks", 1]],
  });

  const selectorCriteria: Array<CardSelectorCriteria> = [
    {
      heuristicType: HeuristicType.DRAW,
      terminalType: TerminalType.NONTERMINAL,
      drawCriteria: {atLeastOne: true}
    },
    {
      heuristicType: HeuristicType.PAYLOAD_GAINER,
    },
    {
      heuristicType: HeuristicType.DRAW,
    },
  ]

  const selector = new CardSelector(
    game.currentPlayer,
    [],
    selectorCriteria,
  );
  const result = selector.getCardFromCriteria(game.currentPlayer.hand, selectorCriteria);

  const copper = new Copper();
  game.p1.addToAllCards(copper);
  game.p1.discard.push(copper);

  const resultLab = selector.getCardFromCriteria(game.currentPlayer.hand, selectorCriteria);

  it("will play a non-terminal gainer before drawing if the deck is drawn", () => {
    expect(result?.name).toEqual(Ironworks.NAME);
  });

  it("will play draw before a gainer if there is a card to be drawn", () => {
    expect(resultLab?.name).toEqual(Laboratory.NAME);
  });
});

describe("Card selector with draw conditions to only play draw if all will be used", () => {
  const game = new Game({
    logLevel: LogLevel.EXTREME,
    logMode: LogMode.SILENT,
    p1cards: [["Laboratory", 1], ["Ironworks", 1]],
  });

  const selectorCriteria: Array<CardSelectorCriteria> = [
    {
      heuristicType: HeuristicType.DRAW,
      terminalType: TerminalType.NONTERMINAL,
      drawCriteria: {allPotential: true}
    },
    {
      heuristicType: HeuristicType.PAYLOAD_GAINER,
    },
    {
      heuristicType: HeuristicType.DRAW,
    },
  ]

  const selector = new CardSelector(
    game.currentPlayer,
    [],
    selectorCriteria,
  );

  const copper = new Copper();
  game.p1.addToAllCards(copper);
  game.p1.discard.push(copper);

  const result = selector.getCardFromCriteria(game.currentPlayer.hand, selectorCriteria);
  it("selects ironworks with only one card in the discard and lab in hand", () => {
    expect(result?.name).toEqual(Ironworks.NAME);
  });

});

describe("Card selector with multiple draw cards in hand", () => {
  const game = new Game({
    logLevel: LogLevel.EXTREME,
    logMode: LogMode.SILENT,
    p1cards: [["Wharf", 3], ["Smithy", 1], ["Copper", 1]],
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


  it("will play a smithy over a gear with a simple rule to draw the most cards now", () => {
    expect(result[0].name).toEqual(Smithy.NAME);
  });
}); 

describe("Card selector with different ranger token states", () => {
  const game = new Game({
    logLevel: LogLevel.EXTREME,
    logMode: LogMode.SILENT,
    p1cards: [["Ranger", 2], ["Smithy", 2], ["Copper", 1]],
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
  game.p1.journeyTokenUp = true;
  const result = selector.getCardsFromCriteria(game.currentPlayer.hand, 0, 1);

  game.p1.journeyTokenUp = false;
  const result2 = selector.getCardsFromCriteria(game.currentPlayer.hand, 0, 1);

  it("will play ranger before smithy if the ranger will draw", () => {
    expect(result[0].name).toEqual(Ranger.NAME);
  });

  it("will play smithy before ranger if the ranger will not draw", () => {
    expect(result2[0].name).toEqual(Smithy.NAME);
  });
}); 