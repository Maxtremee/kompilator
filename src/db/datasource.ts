import { DataSource, type DataSourceOptions } from "typeorm";
import { PlaylistItem } from "./entities/playlist-item.entity";
import { Playlist } from "./entities/playlist.entity";

export const dataSourceOptions: DataSourceOptions = {
	type: "sqlite",
	database: "config/db.sqlite",
	migrations: ["./dist/src/db/migrations/*.js"],
	synchronize: process.env.DB_SYNC === "true",
	entities: [PlaylistItem, Playlist],
};

export const dataSource = new DataSource(dataSourceOptions);
