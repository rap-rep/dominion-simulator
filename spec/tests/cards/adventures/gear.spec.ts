import { Card } from "@src/core/card";
import { Gear } from "@src/core/cards/adventures/gear";
import { Market } from "@src/core/cards/base/market";
import { Copper } from "@src/core/cards/basic/copper";
import { Estate } from "@src/core/cards/basic/estate";
import { Game } from "@src/core/game";
import { LogLevel, LogMode } from "@src/core/logging/game_log";

describe("Gear with a standard hand", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.deck = new Array();

  const gear = new Gear();
  game.p1.addCardToHand(gear);

  game.p1.topdeck(new Copper());
  game.p1.topdeck(new Copper());
  game.p1.topdeck(new Copper());
  game.p1.topdeck(new Copper());
  game.p1.topdeck(new Copper());

  game.p1.addCardToHand(new Estate());
  game.p1.addCardToHand(new Estate());

  game.p1.playActionPhase();

  const resultList: Card[] = gear.setAsideDecision?.result as Card[];

  it("draws two cards and sets aside two estates", () => {
    expect(game.p1.actions).toBe(0);
    expect(game.p1.deck.length).toBe(3);
    expect(resultList.length).toBe(2);
    expect(resultList[0].name).toEqual(Estate.NAME);
    expect(resultList[1].name).toEqual(Estate.NAME);
  });
});

describe("Terminal gear", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.deck = new Array();

  const gear = new Gear();
  game.p1.addCardToHand(gear);

  for (let i = 0; i < 5; i++) {
    game.p1.topdeck(new Copper());
  }

  game.p1.addCardToHand(new Market());
  game.p1.actions--;
  game.p1.removeCardFromHand(gear);
  game.p1.effectResolver.playCard(game.p1, gear);

  const resultList: Card[] = gear.setAsideDecision?.result as Card[];

  it("sets aside a Market", () => {
    expect(game.p1.actions).toBe(0);
    expect(game.p1.deck.length).toBe(3);
    expect(resultList.length).toBe(1);
    expect(resultList[0].name).toEqual(Market.NAME);
  });
});

describe("Gear setting aside nothing", () => {
  const game = new Game({logLevel: LogLevel.INFO, logMode: LogMode.SILENT, p1cards: []});

  const gear = new Gear();
  game.p1.addCardToHand(gear, true);

  game.p1.playActionPhase();
  const resultList: Card[] = gear?.setAsideDecision?.result as Card[];
  game.p1.playCleanupPhase();

  it("gets cleaned up from play", () => {
    expect(gear).toBeDefined();
    expect(game.p1.hand.size).toBe(1);
    expect(resultList.length).toBe(0);
    expect(game.p1.inPlay.length).toBe(0);
  });
});

describe("Nonterminal gear", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.deck = new Array();

  const gear = new Gear();
  game.p1.addCardToHand(gear);
  game.p1.actions = 10;

  for (let i = 0; i < 5; i++) {
    game.p1.topdeck(new Copper());
  }

  game.p1.addCardToHand(new Market());
  game.p1.removeCardFromHand(gear);
  game.p1.effectResolver.playCard(game.p1, gear);

  const resultList: Card[] = gear.setAsideDecision?.result as Card[];

  it("does not set aside Market", () => {
    expect(game.p1.actions).toBe(10);
    expect(game.p1.deck.length).toBe(3);
    expect(resultList.length).toBe(0);
  });
});

describe("Terminal gear", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.deck = new Array();

  const gear = new Gear();
  game.p1.addCardToHand(gear);

  for (let i = 0; i < 15; i++) {
    game.p1.topdeck(new Copper());
  }

  game.p1.addCardToHand(new Market());
  game.p1.actions--;
  game.p1.removeCardFromHand(gear);
  game.p1.effectResolver.playCard(game.p1, gear);
  game.p1.playCleanupPhase();
  game.p1.playStartTurn();

  it("sets aside a Market and puts it in hand next turn", () => {
    expect(game.p1.inPlay?.[0].name).toEqual(Gear.NAME);
    expect(game.p1.deck.length).toBe(8);
    expect(game.p1.hand.get(Market.NAME)).toBeDefined();
    expect(game.p1.inPlay.length).toEqual(1);
    expect(game.p1.discard.length).toEqual(2);
  });
});

describe("Gear on the second turn after it is played", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.deck = new Array();

  const gear = new Gear();
  game.p1.addCardToHand(gear);
  game.p1.addCardToHand(new Market());

  for (let i = 0; i < 15; i++) {
    game.p1.topdeck(new Copper());
  }

  game.p1.actions--;
  game.p1.removeCardFromHand(gear);
  game.p1.effectResolver.playCard(game.p1, gear);
  // duration turn
  game.p1.playCleanupPhase();
  game.p1.playStartTurn();

  // turn which should have no effect
  game.p1.playCleanupPhase();
  game.p1.playStartTurn();

  it("is removed from play and has no effect", () => {
    expect(game.p1.inPlay.length).toEqual(0);
    expect(game.p1.deck.length).toBe(3);
    expect(game.p1.hand.get(Market.NAME)).toBeUndefined();
    expect(game.p1.hand.get(Gear.NAME)).toBeUndefined();
    expect(game.p1.hand.get(Copper.NAME)?.length).toEqual(5);
    expect(game.p1.discard.length).toEqual(9);
  });
});
