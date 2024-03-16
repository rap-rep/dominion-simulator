import HttpStatusCodes from "@src/constants/HttpStatusCodes";

import UserService from "@src/services/UserService";
import { IUser } from "@src/models/User";
import { IReq, IRes } from "./types/express/misc";
import { Game } from "@src/core/game";

// **** Functions **** //

// TODO Fix this file, currently in testing/play-around mode
async function getGame(_: IReq, res: IRes) {
  const game = new Game();
  game.playGame();
  return res.status(HttpStatusCodes.OK).json({ turns: game.turn });
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
  getAll,
  add,
  update,
  delete: delete_,
} as const;
