/// index.ts
///
/// [Description]
/// Entrypoint and HTTP/HTTPS server for the Projekt Monsterz API.
/// 
/// [Author]
/// Lockett, Charlotte <lockettc@protonmail.com>
///
/// [Date]
/// 2023/03/24
///
import path from "path";
import * as dotenv from 'dotenv';
dotenv.config( { path: path.resolve(__dirname, `..${path.sep}.env`) } );

import fs from "fs";
import http from "http";
import https from "https";

import { json } from "body-parser";
import express, { Router } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import { parseBoolean } from "./shared/util";
import baseLogger from "./shared/logger";

import authRouter from "./auth/auth.routes";
import usersRouter from "./users/users.routes";
import leaderboardRouter from "./leaderboard/leaderboard.routes";

const logger = baseLogger.child({});
logger.defaultMeta = { source: "projekt_monsterz::api" };

const morganStream = {
  write: (message: string) => {
    logger.info(message);
  }
};

const app = express();
app.use(morgan("combined", { stream: morganStream }));
app.use(helmet({ }));
app.use(json());
app.use(cors({ "origin": "http://localhost:4200" }));

const router = Router();
router.get("/", (req, res) => { res.status(200).send("Connected"); });
router.use("/user", usersRouter);
router.use("/auth", authRouter);
router.use("/leaderboard", leaderboardRouter);

app.use(router);

const HTTP_ENABLED = parseBoolean(process.env.HTTP_ENABLE) || false;
const HTTP_PORT = parseInt(process.env.HTTP_PORT) || 8080;
if (HTTP_ENABLED) {
  logger.verbose("HTTP is enabled - starting ...");
  try {
    logger.debug("Attempting to create the HTTP server ...");
    const httpServer = http.createServer(app);
    logger.debug(`Attempting to listen on port ${HTTP_PORT} ...`);
    httpServer.listen(HTTP_PORT);
    logger.info(
      "HTTP server started and listening on " +
      `http://localhost:${HTTP_PORT}`
    );
    process.on("SIGINT", httpServer.close);
    process.on("SIGUSR2", httpServer.close);
  } catch (err) {
    logger.error(`HTTP server failed to start.`, { error: err });
  }
} else {
  logger.debug("HTTP is disabled - skipping ...");
}

const HTTPS_DISABLED = parseBoolean(process.env.HTTPS_DISABLE) || false;
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT) || 8888;
const HTTPS_CERT_DIR = path.resolve(__dirname, "../cert");
if (!HTTPS_DISABLED) {
  logger.verbose("HTTPS is enabled - starting ...");
  try {
    logger.debug("Attempting to read the HTTPS key ...");
    const HTTPS_KEY = fs.readFileSync(
      `${HTTPS_CERT_DIR}/server.key`,
      { encoding: "utf-8" }
    );
    logger.debug("Attempting to read the HTTPS certificate ...");
    const HTTPS_CERT = fs.readFileSync(
      `${HTTPS_CERT_DIR}/server.crt`,
      { encoding: "utf-8" }
    );
    logger.debug("Attempting to create the HTTPS server ...");
    const httpsServer = https.createServer(
      { key: HTTPS_KEY, cert: HTTPS_CERT },
      app
    );
    logger.debug(`Attempting to listen on port ${HTTPS_PORT} ...`);
    httpsServer.listen(HTTPS_PORT);
    logger.info(
      "HTTPS server started and listening on " +
      `https://localhost:${HTTPS_PORT}`
    );
    process.on("SIGINT", httpsServer.close);
    process.on("SIGUSR2", httpsServer.close);
  } catch (err) {
    logger.error(`HTTPS server failed to start.`, { error: err });
  }
} else {
  logger.debug("HTTPS is disabled - skipping ...");
}
