import type { LogLevel } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { dataSource } from "./db/datasource";

Object.freeze(globalThis);

async function migration() {
	try {
		await dataSource.initialize();
		console.log("Initializing DB connection");
		await dataSource.runMigrations({
			transaction: "all",
		});
		console.log("All migrations run");
		await dataSource.destroy();
		console.log("Closing DB connection");
	} catch (error) {
		console.log(`Error during DB migration: ${error?.message}`);
	}
}

async function bootstrap() {
	await migration();

	const configService = new ConfigService();

	const app = await NestFactory.create(AppModule, {
		logger: [configService.get<LogLevel>("LOG_LEVEL") ?? "log"],
	});

	await app.listen(configService.get<string>("PORT") ?? 3000);
}

bootstrap();
