import HttpStatusCodes from "@src/constants/HttpStatusCodes";

import UserService from "@src/services/UserService";
import { IUser } from "@src/models/User";
import { IReq, IRes } from "./types/express/misc";
import { Game } from "@src/core/game";
import { ConditionSetList } from "@src/core/logic/ordered_condition_gaining";
import { LogLevel, LogMode } from "@src/core/logging/game_log";
import { EventQueryInput } from "@src/core/logging/event_query";
import { GameManager } from "@src/core/game_manager";

// **** Functions **** //

// TODO Fix this file, currently in testing/play-around mode
async function getGame(_: IReq, res: IRes) {
  const game = new Game();
  game.playGame();
  return res.status(HttpStatusCodes.OK).json({ turns: game.turn });
}

async function postGame(
  req: IReq<{
    p1rules: ConditionSetList;
    p2rules: ConditionSetList;
    eventQueries: EventQueryInput[];
    numGames: number;
    includeSampleLog: boolean;
  }>,
  res: IRes,
) {
  const { p1rules, p2rules, eventQueries, numGames, includeSampleLog } = req.body;

  const config = {
    p1gainRules: p1rules,
    p2gainRules: p2rules,
    logMode: includeSampleLog ? LogMode.BUFFER: LogMode.SILENT,
    logLevel: LogLevel.INFO,
  };

  const gameManager = new GameManager(config, numGames, eventQueries, includeSampleLog);
  gameManager.playGames();
  return res.status(HttpStatusCodes.OK).json({
    turns: gameManager.currentGame.turn,
    results: gameManager.eventQueryManager.getJsonResults(numGames),
    log: gameManager.sampleLog,
  });
}

/**
 * Get all users.
 */
async function getAll(_: IReq, res: IRes) {
  const users = await UserService.getAll();
  return res.status(HttpStatusCodes.OK).json({ users });
}

/**
 * Add one user.
 */
async function add(req: IReq<{ user: IUser }>, res: IRes) {
  const { user } = req.body;
  await UserService.addOne(user);
  return res.status(HttpStatusCodes.CREATED).end();
}

/**
 * Update one user.
 */
async function update(req: IReq<{ user: IUser }>, res: IRes) {
  const { user } = req.body;
  await UserService.updateOne(user);
  return res.status(HttpStatusCodes.OK).end();
}

/**
 * Delete one user.
 */
async function delete_(req: IReq, res: IRes) {
  const id = +req.params.id;
  await UserService.delete(id);
  return res.status(HttpStatusCodes.OK).end();
}

// **** Export default **** //

export default {
  getGame,
  postGame,
  getAll,
  add,
  update,
  delete: delete_,
} as const;
