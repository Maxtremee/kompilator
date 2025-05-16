import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Playlist } from "./playlist.entity";

@Entity()
export class PlaylistItem {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 4096 })
	url: string;

	@ManyToOne(
		() => Playlist,
		(playlist) => playlist.id,
		{
			nullable: true,
		},
	)
	playlist?: Playlist;
}
