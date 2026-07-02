import winston from "winston";
import { isProd } from "./env";

// One logger instance for the whole app. In production this can be piped
// to a log aggregator (e.g. Datadog, Logtail) by adding a transport —
// nothing else in the codebase needs to change.
export const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    isProd ? winston.format.json() : winston.format.combine(winston.format.colorize(), winston.format.simple())
  ),
  transports: [new winston.transports.Console()],
});
