import "dotenv/config";
import { DataSource, type DataSourceOptions } from "typeorm";
import { PlaylistItem } from "./entities/playlist-item.entity";
import { Playlist } from "./entities/playlist.entity";
import { ConfigService } from "@nestjs/config";

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
	type: "sqlite",
	database: "config/db.sqlite",
	migrations: ["./dist/src/db/migrations/*.js"],
	synchronize: configService.get<string>("DB_SYNC") === "true",
	entities: [PlaylistItem, Playlist],
};

export const dataSource = new DataSource(dataSourceOptions);
