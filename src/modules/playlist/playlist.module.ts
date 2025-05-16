import { Module } from "@nestjs/common";
import { PlaylistService } from "./playlist.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Playlist } from "~/db/entities/playlist.entity";
import { PlaylistItemModule } from "../playlist-item/playlist-item.module";
import { PlaylistItemService } from "../playlist-item/playlist-item.service";
import { PlaylistItem } from "~/db/entities/playlist-item.entity";
import { PlaylistStorageService } from "./playlist-storage.service";
import { BullModule } from "@nestjs/bullmq";
import { BullBoardModule } from "@bull-board/nestjs";
import { QUEUES } from "~/common/queue";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { PlaylistConsumer } from "./playlist.consumer";
import { RenderModule } from "../render/render.module";
import { RenderService } from "../render/render.service";

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
