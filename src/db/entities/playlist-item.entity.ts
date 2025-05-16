import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Playlist } from "./playlist.entity";

export const PlaylistStatus = ["started", "finished", "rendering"] as const;
export type PlaylistStatus = (typeof PlaylistStatus)[number];

@Entity()
export class PlaylistItem {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 4096 })
	url: string;

	@ManyToOne(
		() => Playlist,
		(playlist) => playlist.id,
	)
	playlist: Playlist;
}
