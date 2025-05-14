import { DataSource, type DataSourceOptions } from "typeorm";
import { FirstEntity } from "./entities/first.entity";

export const dataSourceOptions: DataSourceOptions = {
	type: "sqlite",
	database: "db.sqlite",
	migrations: ["./migrations/*.ts"],
	migrationsTableName: "migrations",
	synchronize: process.env.DB_SYNC === "true",
	entities: [FirstEntity],
};

export const dataSource = new DataSource(dataSourceOptions);
