import "dotenv/config";
import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModuleOptions } from "@bull-board/nestjs";
import { BullRootModuleOptions } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";

const configService = new ConfigService();

const additionalConnectionProps = () => {
	if (configService.get<string>("DB_SSL") !== "true") {
		return {};
	}
	return {
		username: configService.getOrThrow<string>("QUEUE_USERNAME"),
		password: configService.getOrThrow<string>("QUEUE_PASSWORD"),
		tls: true,
	} as Omit<BullRootModuleOptions["connection"], "port" | "host">;
};

export const queueOptions: BullRootModuleOptions = {
	connection: {
		host: configService.getOrThrow<string>("QUEUE_HOST"),
		port: configService.getOrThrow<number>("QUEUE_PORT"),
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
