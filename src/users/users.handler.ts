import { User } from "@prisma/client";
import { Router, Request, Response } from "express";
import crypto from "crypto";

import UsersDataBus from "./users.db";
import AuthDataBus from "../auth/auth.db";

import ApiResponse from "../shared/ApiResponse";

import baseLogger from "../shared/logger";
const logger = baseLogger.child({});
logger.defaultMeta = { source: "projekt_monsterz::api::UsersHandler" };

export default class UsersHandler {

  /**
   * Responds to requests to find a user using the userId. Requires
   * a parameter in the route to be labelled as `userId`.
   */
  static GetUserById(req: Request, res: Response) {
    const logSrc = "projekt_monsterz::api::UsersHandler::GetUserById";
    // Check that a valid userId has been provided.
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId < 1) {
      return ApiResponse.UserError("error: invalid user id").Send(res);
    }
    // Process the request.
    try {
      return UsersDataBus.SelectUserById(userId)
        .then((foundUser) => {
          return ApiResponse.Ok("", [foundUser]).Send(res);
        })
        .catch((findUserFailReason) => {
          logger.error(
            `Unhandled error encountered\n${findUserFailReason}`,
            { source: logSrc }
          );
          return ApiResponse.ServerError().Send(res);
        });
    } catch (getUserError) {
      logger.error(
        `Unhandled error encountered\n${getUserError}`,
        { source: logSrc }
      );
      return ApiResponse.ServerError().Send(res);
    }
  }

  /**
   * Responds to requests to find a user using the username. Requires
   * a parameter in the route to be labelled as `username`.
   */
  static GetUserByUsername(req: Request, res: Response) {
    const logSrc = "projekt_monsterz::api::UsersHandler::GetUserByUsername";
    try {
      const username = req.params.username;
      return UsersDataBus.SelectUserByUsername(username)
        .then((foundUser) => {
          return ApiResponse.Ok("", [foundUser]).Send(res);
        })
        .catch((findUserFailReason) => {
          logger.error(
            `Unhandled error encountered\n${findUserFailReason}`,
            { source: logSrc }
          );
          return ApiResponse.ServerError().Send(res);
        });
    } catch (getUserError) {
      logger.error(
        `Unhandled error encountered\n${getUserError}`,
        { source: logSrc }
      );
      return ApiResponse.ServerError().Send(res);
    }
  }

  static CreateUser(req: Request, res: Response) {
    const logSrc = "projekt_monsterz::api::UsersHandler::CreateUser";
    // Validate that each required field is present.
    if (
      typeof req.body.username === "undefined" ||
      typeof req.body.auth_key === "undefined" ||
      typeof req.body.verification_method === "undefined" ||
      typeof req.body.verification_value === "undefined"
    ) {
      logger.error(`Bad request:\n${JSON.stringify(req.body)}`, { source: logSrc });
      return ApiResponse.UserError("Missing required fields").Send(res);
    }
    const username: string = req.body.username;
    const auth_key: string = req.body.auth_key;
    const verification_method: number = parseInt(req.body.verification_method);
    const verification_value: string = req.body.verification_value;
    // Validate values of fields.
    if (username.length < 6 || !username.match(/^[a-zA-Z][a-zA-Z0-9]+$/)) {
      logger.error(`Bad request:\n${JSON.stringify(req.body)}`, { source: logSrc });
      return ApiResponse.UserError("Username is invalid").Send(res);
    }
    if (isNaN(verification_method) || verification_method < 0 || verification_method > 1) {
      logger.error(`Bad request:\n${JSON.stringify(req.body)}`, { source: logSrc });
      return ApiResponse.UserError("Invalid verification method").Send(res);
    }
    // Hashed auth_key should be 16 + 1 + 64  characters
    if (auth_key.length !== 81 || auth_key[16] !== "$") {
      logger.error(`Bad request:\n${JSON.stringify(req.body)}`, { source: logSrc });
      return ApiResponse.UserError("Invalid auth_key formatting").Send(res);
    }
    try {
      const user: User = {
        id: undefined,
        username: username,
        user_type: verification_method,
        verified: false,
        verification_method: verification_method,
        verification_value: verification_value,
        lesson_current: undefined,
        lesson_current_progress: undefined,
        monster_hash: crypto.createHmac("md5", req.body.username).digest("hex")
      }
      return UsersDataBus.InsertUser(user)
        .then((createdUser) => {
          // Insert the authorization details into a separate table at
          // the same time as handling the user.
          return AuthDataBus.InsertAuth({ user_id: createdUser.id, auth_key: auth_key })
            .then((authResponse) => {
              // Return the newly created user details.
              return ApiResponse.Created("User created", [createdUser]).Send(res);
            })
            .catch((authFailReason) => {
              logger.error(
                `Uncaught error occurred\n${authFailReason}`,
                { source: logSrc }
              );
              // If there was an error with the authentication, delete
              // the new user and return the error.
              return UsersDataBus.DeleteUserById(user.id)
                .then((deletedUser) => {
                  return ApiResponse.ServerError().Send(res);
                })
                .catch((deleteUserFailReason) => {
                  logger.error(
                    `Uncaught error occurred\n${deleteUserFailReason}`,
                    { source: logSrc }
                  );
                  return ApiResponse.ServerError().Send(res);
                });
            });
        })
        .catch((userFailReason) => {
          logger.error(
            `Uncaught error occurred\n${userFailReason}`,
            { source: logSrc }
          );
          return ApiResponse.ServerError().Send(res);
        });
    } catch (insertError) {
      logger.error(
        `Uncaught error occurred\n${insertError}`,
        { source: logSrc }
      );
      return ApiResponse.ServerError().Send(res);
    }
  }

  static DeleteUserById(req: Request, res: Response) {
    const logSrc = "projekt_monsterz::api::UsersHandler::DeleteUserById";
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId < 1) {
      return ApiResponse.UserError("Invalid user id").Send(res);
    }
    try {
      return UsersDataBus.DeleteUserById(userId)
        .then((deletedUser) => {
          // Delete the authorization alongside the user.
          AuthDataBus.DeleteAuthById(userId)
            .then((authData) => {
              return ApiResponse.Deleted("Successfully deleted user").Send(res);
            })
            .catch((authFailReason) => {
              logger.error(
                `Unknown error encounterd\n${authFailReason}`,
                { source: logSrc }
              );
              // If there was an error deleting the auth, we should
              // reinsert the user.
              return UsersDataBus.InsertUser(deletedUser)
                .then((insertedUser) => {
                  return ApiResponse.ServerError().Send(res);
                })
                .catch((insertFailReason) => {
                    logger.error(
                      `Encountered error while resolving another error\n${insertFailReason}`,
                      { source: logSrc }
                    );
                    return ApiResponse.ServerError().Send(res);
                });
            });
        })
        .catch((deleteFailReason) => {
          logger.error(
            `Encountered unhandled error\n${deleteFailReason}`,
            { source: logSrc }
          );
          return ApiResponse.ServerError().Send(res);
        });
    } catch (deleteError) {
      logger.error(
        `Encountered uncaught error\n${deleteError}`,
        { source: logSrc }
      );
      return ApiResponse.ServerError().Send(res);
    }
  }

} // class UsersHandler
