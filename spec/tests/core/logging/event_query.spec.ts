import { Smithy } from "@src/core/cards/base/smithy";
import { Copper } from "@src/core/cards/basic/copper";
import { Wharf } from "@src/core/cards/seaside/wharf";
import { GameManager } from "@src/core/game_manager";
import {
  ByTurnModifier,
  EventQueryInput,
  EventQueryType,
} from "@src/core/logging/event_query";

describe("Game manager with Smithy draw query for a deck with added Smithy", () => {
  const drawQueryInput: EventQueryInput = {
    type: EventQueryType.DRAW_CARD,
    fromCard: Smithy.NAME,
  };
  const gameManager = new GameManager({}, 1, [drawQueryInput], false);

  gameManager.currentGame.currentPlayer.addCardToHand(new Smithy(), true);
  gameManager.playGames();

  const eventQueries = gameManager.eventQueryManager.eventQueries;
  let drawRecords = 0;
  if (eventQueries) {
    drawRecords = eventQueries[0].effectRecords.get(1)?.length || 0;
  }

  const jsonResults = gameManager.eventQueryManager.getJsonResults(1);

  it("Records the Smithy being played at least 4 times for p1, none for p2", () => {
    expect(drawRecords).toEqual(jsonResults[0].average);
    expect(jsonResults.length).toEqual(2);
    expect(jsonResults[0].playerName).toEqual("p1");
    expect(jsonResults[0].average).toBeGreaterThan(11);
    expect(jsonResults[1].average).toEqual(0);
    expect(jsonResults[1].playerName).toEqual("p2");
  });
});

describe("Game manager with Smithy & Wharf draw query for all", () => {
  const drawQueryInput: EventQueryInput = {
    type: EventQueryType.DRAW_CARD,
  };
  const gameManager = new GameManager({}, 1, [drawQueryInput], false);

  gameManager.currentGame.currentPlayer.addCardToHand(new Smithy(), true);
  gameManager.currentGame.currentPlayer.opponent?.addCardToHand(
    new Wharf(),
    true,
  );
  gameManager.currentGame.currentPlayer.opponent?.addCardToHand(
    new Wharf(),
    true,
  );
  gameManager.playGames();

  const jsonResults = gameManager.eventQueryManager.getJsonResults(1);

  it("includes all records", () => {
    expect(jsonResults.length).toEqual(2);
    expect(jsonResults[0].playerName).toEqual("p1");
    expect(jsonResults[0].average).toBeGreaterThan(8);
    expect(jsonResults[1].average).toBeGreaterThanOrEqual(16);
    expect(jsonResults[1].playerName).toEqual("p2");
  });
});

describe("Copper generates plus coins events that are queryable", () => {
  const plusCoinsQueryInput: EventQueryInput = {
    type: EventQueryType.PLUS_COINS,
    fromCard: Copper.NAME,
  };
  const gameManager = new GameManager({}, 1, [plusCoinsQueryInput], false);

  gameManager.playGames();

  const jsonResults = gameManager.eventQueryManager.getJsonResults(1);

  it("Records Copper generating coins", () => {
    expect(jsonResults.length).toEqual(2);
    expect(jsonResults[0].playerName).toEqual("p1");
    expect(jsonResults[0].average).toBeGreaterThan(20);
    expect(jsonResults[1].playerName).toEqual("p2");
    expect(jsonResults[1].average).toBeGreaterThan(20);
  });
});

describe("A specific turn 'on' query", () => {
  const plusCoinsQueryInput: EventQueryInput = {
    type: EventQueryType.PLUS_COINS,
    fromCard: Copper.NAME,
    byTurn: 9,
    byTurnModifier: ByTurnModifier.ON_TURN,
  };
  const gameManager = new GameManager({}, 1, [plusCoinsQueryInput], false);

  gameManager.playGames();

  const eventQueries = gameManager.eventQueryManager.eventQueries;
  let drawRecords = 0;
  if (eventQueries) {
    drawRecords = eventQueries[0].effectRecords.get(1)?.length || 0;
  }

  const jsonResults = gameManager.eventQueryManager.getJsonResults(1);

  it("returns only results for that turn", () => {
    expect(jsonResults.length).toEqual(2);
    expect(jsonResults[0].playerName).toEqual("p1");
    expect(jsonResults[0].average).toBeLessThan(6);
    expect(jsonResults[1].playerName).toEqual("p2");
    expect(jsonResults[1].average).toBeLessThan(6);
  });
});
