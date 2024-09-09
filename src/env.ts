import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DISCORD_CLIENT_ID: z.string().min(1),
		DISCORD_TOKEN: z.string().min(1),
		DISCORD_PASSWORD: z.string().min(1),
		DATABASE_URL: z.string().min(1),
		PORT: z.coerce.number().optional(),
		LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]),
	},
	runtimeEnv: process.env,
});
