import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { DateColumnOptions } from "../date-column-options";
import { Playlist } from "./playlist.entity";

@Entity()
export class PlaylistItem {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@CreateDateColumn(DateColumnOptions)
	createdAt: Date;

	@UpdateDateColumn(DateColumnOptions)
	updatedAt: Date;

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
