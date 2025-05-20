import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QUEUES } from "~/common/queue";
import { PlaylistItem } from "~/db/entities/playlist-item.entity";
import { Playlist } from "~/db/entities/playlist.entity";
import { PlaylistItemModule } from "../playlist-item/playlist-item.module";
import { PlaylistItemService } from "../playlist-item/playlist-item.service";
import { RenderModule } from "../render/render.module";
import { RenderService } from "../render/render.service";
import { PlaylistStorageService } from "./playlist-storage.service";
import { PlaylistConsumer } from "./playlist.consumer";
import { PlaylistService } from "./playlist.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([Playlist, PlaylistItem]),
		BullModule.registerQueue({
			name: QUEUES.RENDER,
		}),
		BullBoardModule.forFeature({
			name: QUEUES.RENDER,
			adapter: BullMQAdapter,
		}),
		PlaylistItemModule,
		RenderModule,
	],
	providers: [
		PlaylistService,
		PlaylistItemService,
		PlaylistStorageService,
		PlaylistConsumer,
		RenderService,
	],
	exports: [
		PlaylistService,
		BullModule.registerQueue({
			name: QUEUES.RENDER,
		}),
	],
})
export class PlaylistModule {}
