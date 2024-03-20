import { Router } from "express";
import jetValidator from "jet-validator";

import Paths from "../constants/Paths";
import User from "@src/models/User";
import UserRoutes from "./UserRoutes";

// **** Variables **** //

const apiRouter = Router(),
  validate = jetValidator();

const gameRouter = Router();
gameRouter.get(Paths.Game.Run, UserRoutes.getGame);
gameRouter.post(Paths.Game.PostRun, UserRoutes.postGame);

// ** Add UserRouter ** //

const userRouter = Router();

// Get all users
userRouter.get(Paths.Users.Get, UserRoutes.getAll);

// Add one user
userRouter.post(
  Paths.Users.Add,
  validate(["user", User.isUser]),
  UserRoutes.add,
);

// Update one user
userRouter.put(
  Paths.Users.Update,
  validate(["user", User.isUser]),
  UserRoutes.update,
);

// Delete one user
userRouter.delete(
  Paths.Users.Delete,
  validate(["id", "number", "params"]),
  UserRoutes.delete,
);

// Add UserRouter
apiRouter.use(Paths.Users.Base, userRouter);
apiRouter.use(Paths.Game.Game, gameRouter);

// **** Export default **** //

export default apiRouter;
