import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from "./db/datasource";
import { ConfigModule } from "@nestjs/config";
import { ConnectModule } from "./modules/connect/connect.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "node:path";
import { DiscordModule } from "./modules/discord/discord.module";
import { RenderModule } from "./modules/render/render.module";
import { PlaylistModule } from "./modules/playlist/playlist.module";
import { CompileModule } from "./modules/compile/compile.module";
import { StorageModule } from "./modules/storage/storage.module";
import { DownloadService } from "./modules/download/download.service";
import { DownloadModule } from "./modules/download/download.module";
import { PlaylistItemModule } from "./modules/playlist-item/playlist-item.module";
import { BullModule } from "@nestjs/bullmq";
import { bullBoardOptions, queueOptions } from "./common/queue";
import { BullBoardModule } from "@bull-board/nestjs";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot(dataSourceOptions),
		BullModule.forRoot(queueOptions),
		BullBoardModule.forRoot(bullBoardOptions),
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
