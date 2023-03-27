/// logger.ts
///
/// [Description]
/// Implementation of a custom Winston logger for use throughout.
///
/// [Author]
/// Lockett, Charlotte <lockettc@protonmail.com>
///
/// [Date]
/// 2023/03/23
///
import winston from "winston";

import { parseBoolean } from "./util";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.printf((info) => {
    const paint = (v: string) => {
      return winston.format.colorize().colorize(info.level, v);
    }
    let output = `[${info.timestamp} / ` +
      `${info.source ? info.source : ''}] ` +
      paint(`[${info.level.toUpperCase()}]: ` +
      `${info.message}`);
    if (info.metadata?.error?.stack) {
      output += `\n${info.metadata.error.stack}`;
    }
    return output;
  })
);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { source: "unknown" },
  transports: [
    new winston.transports.Console({
      format: logFormat,
      level: "error"
    }),
    new winston.transports.File({
      filename: "error.log",
      level: "error"
    }),
    new winston.transports.File({ filename: "combined.log" })
  ]
});

const DEBUG_MODE = parseBoolean(process.env.DEBUG_MODE);
if (DEBUG_MODE) {
  logger.add(new winston.transports.Console({
    format: logFormat,
    level: "silly"
  }));
}

export default logger;
