import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlaylistItem } from "~/db/entities/playlist-item.entity";
import { DownloadModule } from "../download/download.module";
import { DownloadService } from "../download/download.service";
import { StorageModule } from "../storage/storage.module";
import { StorageService } from "../storage/storage.service";
import { PlaylistItemStorageService } from "./playlist-item-storage.service";
import { PlaylistItemService } from "./playlist-item.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([PlaylistItem]),
		StorageModule,
		DownloadModule,
	],
	providers: [
		PlaylistItemService,
		StorageService,
		DownloadService,
		PlaylistItemStorageService,
	],
	exports: [
		PlaylistItemService,
		StorageService,
		DownloadService,
		PlaylistItemStorageService,
	],
})
export class PlaylistItemModule {}
