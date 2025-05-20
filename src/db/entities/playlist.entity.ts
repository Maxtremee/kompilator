import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { DateColumnOptions } from "../date-column-options";
import { PlaylistItem } from "./playlist-item.entity";
import { PlaylistStatus } from "./playlist-status.enum";

@Entity()
export class Playlist {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@CreateDateColumn(DateColumnOptions)
	createdAt: Date;

	@UpdateDateColumn(DateColumnOptions)
	updatedAt: Date;

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
