// keep as first import to check envs asap
import { env } from "./env";

import { createPinoLogger } from "@bogeychan/elysia-logger";
import { start as startWebserver } from "./webserver";
import { start as startDiscord } from "./discord";

// initiate logger
export const logger = createPinoLogger({
	level: env.LOG_LEVEL || "info",
});

// initiate webserver
startWebserver();

// log in to Discord
startDiscord();
