import {
	Collection,
	type CommandInteraction,
	type SlashCommandBuilder,
} from "discord.js";
import ping from "./ping";

export type Command = {
	execute: (interaction: CommandInteraction) => Promise<void>;
	data: SlashCommandBuilder;
};

const commandList: Command[] = [ping];

export const commands = new Collection<string, Command>(
	commandList.map((command) => [command.data.name, command]),
);
