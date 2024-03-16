import { Copper } from "@src/core/cards/basic/copper";
import { Gold } from "@src/core/cards/basic/gold";
import { Silver } from "@src/core/cards/basic/silver";
import { Peddler } from "@src/core/cards/prosperity/peddler";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";

describe("Remove from hand", () => {
  const game = new Game();
  const coppers = game.currentPlayer.hand.get(Copper.NAME);
  const coppers_at_start = coppers?.length || 0;
  if (coppers && coppers.length > 0) {
    game.currentPlayer.removeCardFromHand(coppers[0]);
  }
  const coppers_at_end = coppers?.length || 0;

  it("removes a copper", () => {
    expect(coppers_at_end + 1).toEqual(coppers_at_start);
  });
});

describe("Place hand in discard", () => {
  const game = new Game();
  game.currentPlayer.placeHandInDiscard();
  it("discards entire hand", () => {
    expect(game.currentPlayer.discard.length).toBe(5);
  });
});

describe("Default action selection", () => {
  const game = new Game();
  const hand_size_start = game.currentPlayer.hand.size;
  game.currentPlayer.playActionPhase();
  it("plays an action phase with no action cards", () => {
    expect(game.currentPlayer.hand.size).toEqual(hand_size_start);
  });
});

describe("Default action selection", () => {
  const game = new Game();
  game.p1.addCardToHand(new Peddler());
  game.currentPlayer.playActionPhase();
  it("plays an action phase with an action by playing it", () => {
    expect(game.currentPlayer.inPlay.length).toEqual(1);
    expect(game.currentPlayer.inPlay[0].name).toEqual(Peddler.name);
    expect(game.currentPlayer.actions).toBe(1);
    expect(game.currentPlayer.coins).toBe(1);
    expect(PlayerHelper.countHandSize(game.currentPlayer)).toEqual(6);
  });
});

describe("shuffle deck", () => {
  const game = new Game();
  const deck_one = game.p1
    .defaultStartingDeck()
    .map((card) => card.name)
    .join(",");
  const deck_two = game.p1
    .defaultStartingDeck()
    .map((card) => card.name)
    .join(",");
  const deck_three = game.p1
    .defaultStartingDeck()
    .map((card) => card.name)
    .join(",");
  const deck_four = game.p1
    .defaultStartingDeck()
    .map((card) => card.name)
    .join(",");

  const allEqual = [deck_one, deck_two, deck_three, deck_four].every(
    (val, _i, arr) => val === arr[0],
  );
  it("results in decks with different orders", () => {
    expect(allEqual).toBeFalse();
  });
});

describe("Default treasure selection", () => {
  const game = new Game();
  game.currentPlayer.addCardToHand(new Peddler());
  const coppersAtStart = game.currentPlayer.hand.get(Copper.NAME)?.length || 0;
  game.currentPlayer.playTreasurePhase();
  const coppersAfter = game.currentPlayer.hand.get(Copper.NAME)?.length;
  const coppersInPlay = game.currentPlayer.inPlay.filter(
    (card) => card.name === Copper.NAME,
  );
  it("plays all treasures out of the hand", () => {
    expect(coppersAtStart).toBeGreaterThan(1);
    expect(coppersAfter).toBeUndefined();
    expect(coppersInPlay.length).toEqual(coppersAtStart);
    expect(game.currentPlayer.coins).toEqual(coppersAtStart);
  });
});

describe("Default buy phase", () => {
  const game = new Game();
  game.currentPlayer.coins = 3;
  game.currentPlayer.playBuyPhase();
  const silvers_in_kingdom =
    game.kingdom.supplyPiles.get(Silver.NAME)?.length || 0;
  it("buys a silver with 3 coins", () => {
    expect(game.currentPlayer.discard.length).toBe(1);
    expect(silvers_in_kingdom).toBe(39);
    expect(
      game.currentPlayer.discard.map((card) => card.name).includes(Silver.NAME),
    ).toBeTrue();
  });
});

describe("Cards in play are discarded", () => {
  const game = new Game();
  game.currentPlayer.inPlay.push(new Gold());
  game.currentPlayer.inPlay.push(new Gold());
  game.currentPlayer.placeInPlayInDiscard();
  it("such as a Golds", () => {
    expect(game.currentPlayer.inPlay.length).toBe(0);
    expect(game.currentPlayer.discard.length).toBe(2);
  });
});

describe("Multiple different cards in play are discarded", () => {
  const game = new Game();
  game.currentPlayer.inPlay.push(new Gold());
  game.currentPlayer.inPlay.push(new Gold());
  game.currentPlayer.playTreasurePhase();
  game.currentPlayer.placeInPlayInDiscard();
  it("such as the starting hand and golds", () => {
    expect(game.currentPlayer.inPlay.length).toBe(0);
    expect(game.currentPlayer.discard.length).toBeGreaterThanOrEqual(4);
  });
});

describe("Card drawing", () => {
  const game = new Game();
  game.currentPlayer.drawCard();
  it("draws a card", () => {
    expect(PlayerHelper.countHandSize(game.currentPlayer)).toBe(6);
  });
});

describe("Card drawing", () => {
  const game = new Game();
  game.currentPlayer.discard.push(new Gold());
  for (let i = 0; i < 6; i++) {
    game.currentPlayer.drawCard();
  }
  it("triggers a shuffle", () => {
    expect(PlayerHelper.countHandSize(game.currentPlayer)).toBe(11);
    expect(game.currentPlayer.discard.length).toBe(0);
  });
});

describe("Default clean up", () => {
  const game = new Game();
  game.currentPlayer.inPlay.push(new Gold());
  game.currentPlayer.playCleanupPhase();
  it("places starting hand and treasures into discard and draws a new hand", () => {
    expect(game.currentPlayer.inPlay.length).toBe(0);
    expect(game.currentPlayer.discard.length).toBe(6);
    expect(PlayerHelper.countHandSize(game.currentPlayer)).toBe(5);
  });
});

describe("Adding a card to all cards functionality", () => {
  const game = new Game();
  game.p1.deck = [];
  game.p1.hand = new Map();
  game.p1.allCardsList = [];

  const card = new Silver();
  game.p1.addCardToHand(card);
  game.p1.addToAllCards(card);

  it("adds a card to the list and map", () => {
    expect(game.p1.allCardsList[0]?.name).toEqual(Silver.NAME);
    expect(game.p1.allCardsMap.get(Silver.NAME)?.length).toEqual(1);
    expect(game.p1.allCardsMap.size).toBe(3);
  });
});

describe("Adding and then removing cards from a player", () => {
  const game = new Game();
  game.p1.deck = [];
  game.p1.hand = new Map();
  game.p1.allCardsList = [];

  const card = new Silver();
  const card2 = new Silver();
  game.p1.addToAllCards(card);
  game.p1.addToAllCards(card2);

  game.p1.removeFromAllCards(card);
  game.p1.removeFromAllCards(card2);

  it("successfully removes the cards", () => {
    expect(game.p1.allCardsList.length).toEqual(0);
    expect(game.p1.allCardsMap.size).toBe(2);
  });
});
