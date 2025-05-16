import { Module } from "@nestjs/common";
import { PlaylistService } from "./playlist.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Playlist } from "~/db/entities/playlist.entity";
import { PlaylistItem } from "~/db/entities/playlist-item.entity";

@Module({
	imports: [TypeOrmModule.forFeature([PlaylistItem, Playlist])],
	providers: [PlaylistService],
	exports: [PlaylistService],
})
export class PlaylistModule {}
