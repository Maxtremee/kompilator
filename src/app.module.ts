import { join } from "node:path";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { TypeOrmModule } from "@nestjs/typeorm";
import { bullBoardOptions, queueOptions } from "./common/queue";
import { dataSourceOptions } from "./db/datasource";
import { CompileModule } from "./modules/compile/compile.module";
import { ConnectModule } from "./modules/connect/connect.module";
import { DiscordModule } from "./modules/discord/discord.module";
import { DownloadModule } from "./modules/download/download.module";
import { DownloadService } from "./modules/download/download.service";
import { PlaylistItemModule } from "./modules/playlist-item/playlist-item.module";
import { PlaylistModule } from "./modules/playlist/playlist.module";
import { RenderModule } from "./modules/render/render.module";
import { StorageModule } from "./modules/storage/storage.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot(dataSourceOptions),
		BullModule.forRoot(queueOptions),
		BullBoardModule.forRoot(bullBoardOptions),
		ScheduleModule.forRoot(),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "..", "public"),
		}),
		ConnectModule,
		DiscordModule,
		RenderModule,
		PlaylistModule,
		CompileModule,
		StorageModule,
		DownloadModule,
		PlaylistItemModule,
	],
	providers: [DownloadService],
})
export class AppModule {}
