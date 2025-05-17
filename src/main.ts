import type { LogLevel } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

Object.freeze(globalThis);

async function bootstrap() {
	const configService = new ConfigService();

	const app = await NestFactory.create(AppModule, {
		logger: [configService.get<LogLevel>("LOG_LEVEL") ?? "log"],
	});

	await app.listen(configService.get<string>("PORT") ?? 3000);
}
bootstrap();
