import { SimpleEngineSamplePlayer } from "@src/core/bot_players/simple_engine_player";
import { Province } from "@src/core/cards/basic/province";
import { Game } from "@src/core/game";

describe("A set of games between a simple engine and a default (money) bot", () => {
  let game: Game;
  let wins = 0;
  let losses = 0;
  let turns = 0;
  const SIMS = 1;
  for (let i = 0; i < SIMS; i++) {
    game = new Game();
    game.p2 = new SimpleEngineSamplePlayer("SimpleEngine", game);
    game.p1.opponent = game.p2;
    game.p2.opponent = game.p1;
    game.playGame();
    turns += game.turn;
    if (game.winner === game.p2) {
      wins++;
    } else if (game.winner === game.p1) {
      losses++;
    }
  }
  it("averages less than 25 turns", () => {
    expect(turns / SIMS).toBeLessThan(25);
    expect(game.kingdom.supplyPiles.get(Province.NAME)).toBeDefined();
    expect(game.kingdom.supplyPiles.get(Province.NAME)?.length).toEqual(0);
    //expect(wins).toBeGreaterThan(1);
  });
});
