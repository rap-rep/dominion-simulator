import { Smithy } from "@src/core/cards/base/smithy";
import { GameManager } from "@src/core/game_manager";
import { EventQuery, EventQueryType } from "@src/core/logging/event_query";

describe("Game manager with Smithy draw query for a deck with added Smithy", () => {
  const drawQuery = new EventQuery(EventQueryType.DRAW_CARD, Smithy.NAME);
  const gameManager = new GameManager({}, [drawQuery], 1);

  gameManager.currentGame.currentPlayer.addCardToHand(new Smithy());

  gameManager.playGames();

  const eventQueries = gameManager.eventQueryManager.eventQueries;
  let drawRecords = 0;
  if (eventQueries) {
    drawRecords = eventQueries[0].effectRecords.get(1)?.length || 0;
  }

  it("Records the Smithy being played at least 4 times", () => {
    expect(drawRecords).toBeGreaterThan(11);
  });
});
