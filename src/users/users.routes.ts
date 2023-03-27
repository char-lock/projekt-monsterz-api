import { Request, Response, Router } from "express";
import crypto from "crypto";

import UsersHandler from "./users.handler";
import AuthMiddleware from "../shared/auth.middleware";

import baseLogger from "../shared/logger";
const logger = baseLogger.child({});
logger.defaultMeta = { source: "projekt_monsterz::api::UsersRoute" };

const router = Router();

router.get("/", (req, res) => { res.status(200).send("User endpoint working"); });
router.get("/id/:userId", [AuthMiddleware, UsersHandler.GetUserById]);
router.delete("/id/:userId", [AuthMiddleware, UsersHandler.DeleteUserById]);
router.get("/username/:username", [AuthMiddleware, UsersHandler.GetUserByUsername]);
router.post("/", (req, res) => {
  const salt = crypto.randomBytes(8).toString("hex");
  const cleartext = `${salt}${req.body.username}${req.body.auth_key}`;
  crypto.pbkdf2(cleartext, salt, 310000, 32, "sha256", (err, hashed) => {
    if (err) {
      logger.error(`failed to generate password: ${err}`);
    } else {
      req.body.auth_key = `${salt}$${hashed.toString("hex")}`;
      logger.debug(`auth_key: ${req.body.auth_key}`);
      UsersHandler.CreateUser(req, res);
    }
  });
});

export default router;
