import { Workshop } from "@src/core/cards/base/workshop";
import { Game } from "@src/core/game";
import { LogLine, LogMode } from "@src/core/logging/game_log";

describe("Log indendation", () => {
  const game = new Game({logMode: LogMode.BUFFER});
  game.p1.hand = new Map();
  game.p1.addCard(new Workshop());
  game.p1.playActionPhase();

  let relevantLine: LogLine | undefined;
  for (const line of game.gamelog.loglines){
    if (line.line.includes("gains")){
        relevantLine = line;
    }
  }

  it("records an indented section for Workshop gaining a card", () => {
    // ensure a card is gained to the discard
    expect(game.p1.discard.length).toEqual(1);

    // start of log unindented
    expect(game.gamelog.loglines[0].indentation).toEqual(0);

    expect(relevantLine?.indentation).toEqual(1);

    // log back to unindented mode
    expect(game.gamelog.indentation).toEqual(0);
  });

});
