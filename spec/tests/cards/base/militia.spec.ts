import { Milita } from "@src/core/cards/base/militia";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { LogMode } from "@src/core/logging/game_log";

describe("Militia", () => {
  const game = new Game({ logMode: LogMode.SILENT });
  game.p1.addCardToHand(new Milita());
  game.p1.playActionPhase();
  it("results in opponent discarding cards and the other expected effects", () => {
    expect(game.p1.inPlay.length).toEqual(1);
    expect(game.p1.inPlay[0].name).toEqual(Milita.name);
    expect(game.p1.coins).toEqual(2);
    expect(game.p1.actions).toEqual(0);
    expect(game.p1.buys).toEqual(1);
    expect(PlayerHelper.countHandSize(game.p2)).toBe(3);
  });
});
