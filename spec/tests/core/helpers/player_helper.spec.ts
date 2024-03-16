import { NullCard } from "@src/core/cards/basic/null_card";
import { Peddler } from "@src/core/cards/prosperity/peddler";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";

describe("Default action selection", () => {
  const game = new Game();
  it("Returns null if no action available", () => {
    expect(PlayerHelper.selectAnyAction(game.p1)?.name).toBe(NullCard.NAME);
  });
});

describe("Default action selection", () => {
  const game = new Game();
  game.p1.addCardToHand(new Peddler());
  it("Returns an action if one is available", () => {
    expect(PlayerHelper.selectAnyAction(game.p1)?.name).toBe(Peddler.NAME);
  });
});
