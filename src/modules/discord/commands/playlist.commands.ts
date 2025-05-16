import { Inject, Logger, UseInterceptors } from "@nestjs/common";
import { bold } from "@discordjs/formatters";
import {
	Context,
	createCommandGroupDecorator,
	Options,
	SlashCommandContext,
	StringOption,
	Subcommand,
} from "necord";
import {
	PLAYLIST_NOT_READY,
	PlaylistService,
} from "~/modules/playlist/playlist.service";
import { PlaylistInterceptor } from "./playlist.interceptor";
import { z } from "zod";
import { unorderedList, hyperlink } from "discord.js";
import {
	PlaylistItemDto,
	PlaylistNameAutocompleteDto,
	PlaylistNameDto,
} from "./playlist.dto";

export const PlaylistCommandDecorator = createCommandGroupDecorator({
	name: "playlist",
	description: "Playlist modifier commands",
});

@PlaylistCommandDecorator()
export class PlaylistCommands {
	private readonly logger = new Logger(PlaylistCommands.name);

	constructor(
		@Inject(PlaylistService) private readonly playlistService: PlaylistService,
	) {}

	@Subcommand({
		name: "create",
		description: "Create a playlist",
	})
	public async createPlaylist(
		@Context() [interaction]: SlashCommandContext,
		@Options() { name }: PlaylistNameDto,
	) {
		try {
			await this.playlistService.create(name, interaction.guildId!);
			return interaction.reply({
				content: `✅ Playlist ${bold(name)} created!`,
			});
		} catch (error) {
			this.logger.error(`❌ Error creating playlist: ${error.message}`);
			return interaction.reply({
				content: `❌ Error creating playlist ${bold(name)}`,
			});
		}
	}

	@UseInterceptors(PlaylistInterceptor)
	@Subcommand({
		name: "add",
		description: "Add a URL to a playlist",
	})
	public async addToPlaylist(
		@Context() [interaction]: SlashCommandContext,
		@Options() { name, url }: PlaylistItemDto,
	) {
		if (z.string().url().safeParse(url).success === false) {
			return interaction.reply({
				content: `❌ Invalid URL "${url}"`,
			});
		}

		await interaction.deferReply();

		try {
			await this.playlistService.addToPlaylist(name, interaction.guildId!, url);
			return interaction.editReply({
				content: `✅ Added "${url}" to playlist ${bold(name)}`,
			});
		} catch (error) {
			this.logger.error(`❌ Error adding to playlist: ${error.message}`);
			return interaction.editReply({
				content: `❌ Error adding "${url}" to playlist ${bold(name)}`,
			});
		}
	}

	@UseInterceptors(PlaylistInterceptor)
	@Subcommand({
		name: "get",
		description: "Get a playlist",
	})
	public async getPlaylist(
		@Context() [interaction]: SlashCommandContext,
		@Options() { name }: PlaylistNameAutocompleteDto,
	) {
		try {
			const playlist = await this.playlistService.getByName(
				name,
				interaction.guildId!,
			);

			if (playlist.items.length === 0) {
				return interaction.reply({
					content: `🎵 Playlist ${bold(name)} is empty`,
				});
			}

			return interaction.reply({
				content: `
					🎵 Playlist "${playlist.name}":
					${unorderedList(playlist.items.map((item) => item.url))}
				`,
			});
		} catch (error) {
			this.logger.error(`❌ Error retrieving playlist: ${error.message}`);
			return interaction.reply({
				content: `❌ Error retrieving playlist ${bold(name)}`,
			});
		}
	}

	@Subcommand({
		name: "list",
		description: "List all playlists",
	})
	public async listPlaylists(@Context() [interaction]: SlashCommandContext) {
		try {
			const playlists = await this.playlistService.getForGuild(
				interaction.guildId!,
			);

			if (playlists.length === 0) {
				return interaction.reply({
					content: "❌ No playlists found",
				});
			}

			return interaction.reply({
				content: `
				🎵 Playlists: 
				${unorderedList(playlists.map((p) => `${p.name} (${p.status})`))}
				`,
			});
		} catch (error) {
			this.logger.error(`❌ Error listing playlists: ${error.message}`);
			return interaction.reply({
				content: "❌ Error listing playlists",
			});
		}
	}

	@UseInterceptors(PlaylistInterceptor)
	@Subcommand({
		name: "download",
		description: "Download a playlist",
	})
	public async downloadPlaylist(
		@Context() [interaction]: SlashCommandContext,
		@Options() { name }: PlaylistNameAutocompleteDto,
	) {
		try {
			const playlist = await this.playlistService.getByName(
				name,
				interaction.guildId!,
			);

			if (playlist.items.length === 0) {
				return interaction.reply({
					content: `🎵 Playlist ${bold(name)} is empty`,
				});
			}

			await interaction.reply({
				content: `🎵 Checking if ${bold(name)} is ready...`,
			});

			let isFinished = false;
			do {
				try {
					const url = await this.playlistService.getDownloadLink(playlist.id);
					isFinished = true;
					return interaction.editReply({
						content: `🎵 Playlist ${bold(name)} is ready! Download it ${hyperlink("here", url)}`,
					});
				} catch (error) {
					if (error.message === PLAYLIST_NOT_READY) {
						await interaction.editReply({
							content: `🎵 Playlist ${bold(name)} is rendering. Last update: ${new Date().toISOString()}`,
						});
					}
					// sleep for 10 seconds before checking again
					await new Promise((resolve) => setTimeout(resolve, 10000));
				}
			} while (!isFinished);
		} catch (error) {
			this.logger.error(`❌ Error downloading playlist: ${error.message}`);
			return interaction.reply({
				content: `❌ Error downloading playlist ${bold(name)}`,
			});
		}
	}
}
