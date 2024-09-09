import { REST, Routes } from "discord.js";
import { env } from "../env";
import { commands } from "./commands";
import { logger } from "..";

const rest = new REST().setToken(env.DISCORD_TOKEN);

try {
	logger.info(`Started refreshing ${commands.size} application (/) commands.`);

	const data = (await rest.put(
		Routes.applicationCommands(env.DISCORD_CLIENT_ID),
		{
			body: commands.map((command) => command.data.toJSON()),
		},
	)) as unknown as Array<unknown>;

	logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
	logger.error(error);
}
