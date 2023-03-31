import { Request, Response, Router } from "express";
import LeaderboardHandler from "./leaderboard.handler";

const router = Router();

router.get("/global", LeaderboardHandler.FetchLeaderboardGlobal);
router.get("/class/:classCode", LeaderboardHandler.FetchLeaderboardClass);

export default router;
