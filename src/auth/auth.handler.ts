import crypto from "crypto";
import { Request, Response, Router } from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

import { timingSafeStringEqual } from "../shared/timing-safe-compare";

import UsersDataBus from "../users/users.db";
import AuthDataBus from "./auth.db";
import ApiResponse from "../shared/ApiResponse";

import baseLogger from "../shared/logger";
const logger = baseLogger.child({});
logger.defaultMeta = { source: "projekt_monsterz::api::AuthHandler" };

export default class AuthHandler {

  static IssueNewAuthToken(req: Request, res: Response) {
    const logSrc = "projekt_monsterz::api::AuthHandler::IssueNewAuthToken";
    if (
      typeof req.body.username === "undefined"
      || typeof req.body.password === "undefined"
    ) {
      logger.debug(JSON.stringify(req.body), { source: logSrc });
      return ApiResponse.UserError("Invalid username or password").Send(res);
    }
    const username: string = req.body.username;
    let password: string = req.body.password;
    try {
      // Retrieve the user's ID from the database.
      UsersDataBus.SelectUserByUsername(username.toLowerCase())
        .then((foundUser) => {
          const userId = foundUser.id;
          // Retrieve the authkey for this user.
          AuthDataBus.SelectAuthById(userId)
            .then((foundAuth) => {
              const authSeg = foundAuth.auth_key.split("$");
              password = `${authSeg[0]}${username}${password}`;
              crypto.pbkdf2(password, authSeg[0], 310000, 32, "sha256", (err, hashed) => {
                if (err) {
                  logger.error(`failed to generate hash from password: ${err}`);
                } else {
                  password = hashed.toString("hex");
                  if (timingSafeStringEqual(authSeg[1], password)) {
                    const token = jwt.sign({
                      unm: username,
                      utp: foundUser.user_type,
                      gen: Date.now()
                    }, process.env.JWT_SECRET);
                    return ApiResponse.Ok("Authorized", [{ token: token }]).Send(res);
                  } else {
                    logger.debug(
                      `generated ${password}, need ${authSeg[1]}`,
                      { source: logSrc }
                    );
                    return ApiResponse.UserError("Invalid username or password").Send(res);
                  }
                }
              });
            })
            .catch((authFailReason) => {
              logger.error(
                `Error while getting authkey\n${authFailReason}`,
                { source: logSrc }
              );
              return ApiResponse.ServerError().Send(res);
            });
        })
        .catch((selectUserFailReason) => {
          logger.error(
            `Error while getting userId\n${selectUserFailReason}`,
            { source: logSrc }
          );
          return ApiResponse.ServerError().Send(res);
        });
    } catch (authError) {
      logger.error(
        `Uncaught error\n${authError}`,
        { source: logSrc }
      );
      return ApiResponse.ServerError().Send(res);
    }
  }

  static RefreshAuth(req: Request, res: Response) {
    const logSrc = "projekt_monsterz::api::AuthHandler::RefreshAuth";
    if (typeof req.headers["authorization"] === "undefined") {
      return ApiResponse.UserError("Unauthorised").Send(res);
    }
    const authSeg = req.headers["authorization"].split(" ");
    if (authSeg.length < 2 || authSeg[0] !== "Bearer") {
      logger.debug(authSeg);
      return ApiResponse.UserError("Invalid token").Send(res);
    }
    try {
      const token = jwt.verify(authSeg[1], process.env.JWT_SECRET);
      if (typeof token === "string") {
        logger.error(`Received string jwt: ${token}`, { source: logSrc });
        return ApiResponse.UserError("Invalid token").Send(res);
      }
      const lifespan = parseInt(process.env.JWT_LIFESPAN) * 1000;
      const exp = token["gen"] + lifespan;
      if (Date.now() > exp) {
        logger.error(`Attempted to use expired token: ${JSON.stringify(token)}`, { source: logSrc });
        return ApiResponse.UserError("Invalid token").Send(res);
      } else {
        const newToken = jwt.sign({
          unm: token["unm"],
          utp: token["utp"],
          gen: Date.now()
        }, process.env.JWT_SECRET);
        return ApiResponse.Ok("Refreshed", [{ token: newToken }]).Send(res);
      }
    } catch (refreshError) {
      logger.error(`Error while refreshing token\n${refreshError}`, { source: logSrc });
      return ApiResponse.ServerError().Send(res);
    }
  }

}
