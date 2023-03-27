import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import ApiResponse from "./ApiResponse";

import baseLogger from "./logger";
const logger = baseLogger.child({});
logger.defaultMeta = { source: "projekt_monsterz::api::AuthMiddleware" };

function checkAuth(req: Request, res: Response, next: NextFunction) {
  const logSrc = "project_monsterz::api::AuthMiddleware::checkAuth";
  if (typeof req.headers.authorization === "undefined") {
    return ApiResponse.UserError("Unauthorised").Send(res);
  }
  const authSeg = req.headers.authorization.split(" ");
  if (authSeg[0] !== "Bearer") {
    return ApiResponse.UserError("Bad token").Send(res);
  }
  try {
    const token = jwt.verify(authSeg[1], process.env.JWT_SECRET);
    if (typeof token === "string") {
      logger.error(`Got string token: ${token}`, { source: logSrc });
      return ApiResponse.UserError("Bad token").Send(res);
    }
    const lifespan = parseInt(process.env.JWT_LIFESPAN) * 1000;
    const exp = token["gen"] + lifespan;
    if (Date.now() > exp) {
      return ApiResponse.UserError("Session expired").Send(res);
    }
    return next();
  } catch (checkError) {
    logger.error(`Uncaught error\n${checkError}`, { source: logSrc });
    return ApiResponse.ServerError().Send(res);
  }
}

export default checkAuth;
