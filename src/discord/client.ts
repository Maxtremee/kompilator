import {
	Client,
	GatewayIntentBits,
	Events,
	type ClientOptions,
	type Collection,
} from "discord.js";
import { logger } from "..";
import { commands, type Command } from "./commands";

class KompilatorClient extends Client {
	constructor(commands: Collection<string, Command>, options: ClientOptions) {
		super(options);
		this.commands = commands;
	}
	commands: typeof commands;
}

export const client = new KompilatorClient(commands, {
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(Events.ClientReady, (readyClient) => {
	logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		logger.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		logger.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: "There was an error while executing this command!",
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true,
			});
		}
	}
});
