import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModuleOptions } from "@bull-board/nestjs";
import { BullRootModuleOptions } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";

const configService = new ConfigService();

const additionalConnectionProps = () => {
	if (process.env.DB_SSL !== "true") {
		return {};
	}
	return {
		username: process.env.QUEUE_USERNAME,
		password: process.env.QUEUE_PASSWORD,
		tls: true,
	} as Omit<BullRootModuleOptions["connection"], "port" | "host">;
};

export const queueOptions: BullRootModuleOptions = {
	connection: {
		host: process.env.QUEUE_HOST,
		port: process.env.QUEUE_PORT as unknown as number,
		...additionalConnectionProps(),
	},
};

export const bullBoardOptions: BullBoardModuleOptions = {
	route: "/queues",
	adapter: ExpressAdapter,
};

export const QUEUES = {
	PLAYLIST_ITEM: "playlist-item",
	RENDER: "render",
} as const;
