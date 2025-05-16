import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PlaylistItem } from "./playlist-item.entity";
import { PlaylistStatus } from "./playlist-status.enum";

@Entity()
export class Playlist {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 255 })
	name: string;

	@Column({ type: "varchar", length: 255 })
	guildId: string;

	@Column({
		type: "varchar",
		default: PlaylistStatus[0],
		enum: PlaylistStatus,
	})
	status: PlaylistStatus;

	@OneToMany(
		() => PlaylistItem,
		(playlistItem) => playlistItem.playlist,
	)
	items: PlaylistItem[];
}
