import { Module } from "@nestjs/common";
import { IntentsBitField } from "discord.js";
import { NecordModule } from "necord";
import { PlaylistModule } from "../playlist/playlist.module";
import { PlaylistCommands } from "./commands/playlist.commands";
import { AppUpdateService } from "./discord.service";

@Module({
	imports: [
		NecordModule.forRoot({
			token: process.env.DISCORD_TOKEN!,
			intents: [IntentsBitField.Flags.Guilds],
			development: [process.env.DISCORD_DEVELOPMENT_GUILD_ID!],
		}),
		PlaylistModule,
	],
	providers: [AppUpdateService, PlaylistCommands],
})
export class DiscordModule {}
