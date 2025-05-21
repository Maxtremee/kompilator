import "dotenv/config";
import { DataSource, type DataSourceOptions } from "typeorm";
import { PlaylistItem } from "./entities/playlist-item.entity";
import { Playlist } from "./entities/playlist.entity";
import { ConfigService } from "@nestjs/config";
import * as sqlite from "sqlite3";

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
	type: "sqlite",
	database: "config/db.sqlite",
	migrations: ["./dist/db/migrations/*.js"],
	synchronize: configService.get<string>("DB_SYNC") === "true",
	entities: [PlaylistItem, Playlist],
	logging: configService.get<string>("DB_LOG") === "true",
};

export const dataSource = new DataSource(dataSourceOptions);
