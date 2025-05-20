import { Inject, Injectable } from "@nestjs/common";
import { AutocompleteInteraction } from "discord.js";
import { AutocompleteInterceptor } from "necord";
import { PlaylistService } from "../../playlist/playlist.service";
import {
	PLAYLIST_NAME_FIELD,
	PLAYLIST_NAME_STARTED_FIELD,
} from "./playlist.dto";

@Injectable()
export class PlaylistInterceptor extends AutocompleteInterceptor {
	public constructor(
		@Inject(PlaylistService) private readonly playlistService: PlaylistService,
	) {
		super();
	}

	public async transformOptions(
		interaction: AutocompleteInteraction,
	): Promise<void> {
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === PLAYLIST_NAME_FIELD) {
			const playlists = await this.playlistService.getForGuild(
				interaction.guildId!,
			);
			const filteredPlaylists = playlists.filter((playlist) =>
				playlist.name.toLowerCase().includes(focusedOption.value.toLowerCase()),
			);
			interaction.respond(
				filteredPlaylists.map((playlist) => ({
					name: playlist.name,
					value: playlist.name,
				})),
			);
		}

		if (focusedOption.name === PLAYLIST_NAME_STARTED_FIELD) {
			const playlists = await this.playlistService.getForGuild(
				interaction.guildId!,
				true,
			);
			const filteredPlaylists = playlists.filter((playlist) =>
				playlist.name.toLowerCase().includes(focusedOption.value.toLowerCase()),
			);
			interaction.respond(
				filteredPlaylists.map((playlist) => ({
					name: playlist.name,
					value: playlist.name,
				})),
			);
		}
	}
}
