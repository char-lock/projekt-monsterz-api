import { Request, Response } from "express";
import LeaderboardDataBus from "./leaderboard.db";

import ApiResponse from "../shared/ApiResponse";

import baseLogger from "../shared/logger";
const logger = baseLogger.child({});
logger.defaultMeta = { source: "projekt_monsterz::api::LeaderboardHandler" };

export default class LeaderboardHandler {

  static FetchLeaderboardGlobal(req: Request, res: Response) {
    LeaderboardDataBus.GetTopScoresGlobal()
      .then((scoresGlobal) => {
        if (scoresGlobal.length === 0) return ApiResponse.ServerError().Send(res);
        const leaderboard: (string | number)[][] = [];
        scoresGlobal.forEach((scorePair) => {
          leaderboard.push([scorePair.username, scorePair.lesson_current]);
        });
        return ApiResponse.Ok("", leaderboard).Send(res);
      })
      .catch((scoreFailReason) => {
        logger.error(`Failed to retrieve global leaderboard: ${scoreFailReason}`);
        return ApiResponse.ServerError().Send(res);
      });
  }

  static FetchLeaderboardClass(req: Request, res: Response) {
    const classCode = req.params.classCode;
    LeaderboardDataBus.GetTopScoresClass(classCode)
      .then((scoresClass) => {
        if (scoresClass.length === 0) return ApiResponse.ServerError().Send(res);
        const leaderboard: (string | number)[][] = [];
        scoresClass.forEach((scorePair) => {
          leaderboard.push([scorePair.username, scorePair.lesson_current]);
        });
        return ApiResponse.Ok("", leaderboard).Send(res);
      })
      .catch((scoreFailReason) => {
        logger.error(`Failed to retrieve class leaderboard: ${scoreFailReason}`);
        return ApiResponse.ServerError().Send(res);
      });
  }

}