import {
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { PlaylistItem, PlaylistStatus } from "./playlist-item.entity";

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
		default: "started",
		enum: PlaylistStatus,
	})
	status: PlaylistStatus;

	@OneToMany(
		() => PlaylistItem,
		(playlistItem) => playlistItem.playlist,
	)
	items: PlaylistItem[];
}
