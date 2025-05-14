import { Module } from "@nestjs/common";
import { IntentsBitField } from "discord.js";
import { NecordModule } from "necord";
import { AppUpdateService } from "./discord.service";
import { PingCommand } from "./commands/ping/ping.commands";

@Module({
	imports: [
		NecordModule.forRoot({
			token: process.env.DISCORD_TOKEN!,
			intents: [IntentsBitField.Flags.Guilds],
			development: [process.env.DISCORD_DEVELOPMENT_GUILD_ID!],
		}),
	],
	providers: [AppUpdateService, PingCommand],
})
export class DiscordModule {}
