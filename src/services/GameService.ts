import { Game } from "@src/core/game";

type GameReport = {
  turns: number;
};

function playOne(): GameReport {
  // TODO: NOT USED, NEEDS TO BE CLEANED UP OR USED
  const game = new Game();
  game.playGame();
  return { turns: 19 };
}

// **** Export default **** //

export default {
  playOne,
} as const;
