import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlaylistItem } from "~/db/entities/playlist-item.entity";
import { Playlist } from "~/db/entities/playlist.entity";

@Injectable()
export class PlaylistService {
	private readonly logger = new Logger(PlaylistService.name);

	constructor(
		@InjectRepository(PlaylistItem)
		private readonly playlistItemsRepository: Repository<PlaylistItem>,
		@InjectRepository(Playlist)
		private readonly playlistRepository: Repository<Playlist>,
	) {}

	async createPlaylist(name: string, guildId: string) {
		const playlist = this.playlistRepository.create({
			name: name,
			guildId,
		});

		await this.playlistRepository.save(playlist);

		this.logger.log(`Playlist "${name}" created for guild "${guildId}"`);

		return playlist;
	}

	async addToPlaylist(name: string, guildId: string, url: string) {
		const playlist = await this.playlistRepository.findOne({
			where: { name: name, guildId },
		});

		if (!playlist) {
			throw new Error(`Playlist "${name}" not found`);
		}

		const playlistItem = this.playlistItemsRepository.create({
			playlist,
			url,
		});

		await this.playlistItemsRepository.save(playlistItem);

		this.logger.log(
			`Added URL "${url}" to playlist "${name}" for guild "${guildId}"`,
		);

		return playlistItem;
	}

	async getPlaylist(name: string, guildId: string) {
		const playlist = await this.playlistRepository.findOne({
			where: { name, guildId },
			relations: {
				items: true,
			},
		});

		if (!playlist) {
			throw new Error(`Playlist "${name}" not found`);
		}

		this.logger.debug(`Retrieved playlist "${name}" for guild "${guildId}"`);

		return playlist;
	}

	async deletePlaylist(name: string, guildId: string) {
		const playlist = await this.playlistRepository.findOne({
			where: { name: name, guildId },
		});

		if (!playlist) {
			throw new Error(`Playlist "${name}" not found`);
		}

		await this.playlistRepository.remove(playlist);

		this.logger.log(`Deleted playlist "${name}" for guild "${guildId}"`);
	}

	async getPlaylists(guildId: string) {
		const playlists = await this.playlistRepository.find({
			where: { guildId },
		});

		this.logger.debug(`Retrieved playlists for guild "${guildId}"`);

		return playlists;
	}

	async getStartedPlaylists(guildId: string) {
		const playlists = await this.playlistRepository.find({
			where: { guildId, status: "started" },
		});

		this.logger.debug(`Retrieved started playlists for guild "${guildId}"`);

		return playlists;
	}
}
