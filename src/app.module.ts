import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from "./db/datasource";
import { ConfigModule } from "@nestjs/config";
import { ConnectModule } from "./modules/connect/connect.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "node:path";
import { DiscordModule } from "./modules/discord/discord.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot(dataSourceOptions),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "..", "public"),
		}),
		ConnectModule,
		DiscordModule,
	],
})
export class AppModule {}
