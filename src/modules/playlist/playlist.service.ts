import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Queue } from "bullmq";
import { Repository } from "typeorm";
import { RenderEvent, TOPIC_RENDER } from "~/common/events/render.event";
import { QUEUES } from "~/common/queue";
import { Playlist } from "~/db/entities/playlist.entity";
import { PlaylistItemService } from "../playlist-item/playlist-item.service";
import { StorageService } from "../storage/storage.service";
import { PlaylistStorageService } from "./playlist-storage.service";

export const PLAYLIST_NOT_READY = "playlist-not-ready";

@Injectable()
export class PlaylistService {
	private readonly logger = new Logger(PlaylistService.name);

	constructor(
		@InjectRepository(Playlist)
		private readonly playlistRepository: Repository<Playlist>,
		@Inject(PlaylistItemService)
		private readonly playlistItemService: PlaylistItemService,
		@Inject(PlaylistStorageService)
		private readonly playlistStorageService: PlaylistStorageService,
		@InjectQueue(QUEUES.RENDER)
		private readonly renderQueue: Queue,
	) {}

	async create(name: string, guildId: string) {
		const playlist = this.playlistRepository.create({
			guildId,
			name,
		});

		await this.playlistRepository.save(playlist);

		this.logger.log(`Playlist "${name}" created for guild "${guildId}"`);

		return playlist;
	}

	async addToPlaylist(name: string, guildId: string, url: string) {
		const playlist = await this.playlistRepository.findOne({
			where: { name, guildId },
		});

		if (!playlist) {
			throw new Error(`Playlist "${name}" not found`);
		}

		if (playlist.status !== "started") {
			throw new Error(`Playlist "${name}" is closed for editing`);
		}

		return await this.playlistItemService.create(playlist, url);
	}

	async getById(id: string) {
		const playlist = await this.playlistRepository.findOne({
			where: { id },
			relations: {
				items: true,
			},
		});
		if (!playlist) {
			throw new Error(`Playlist with ID "${id}" not found`);
		}
		this.logger.debug(`Retrieved playlist with ID "${id}"`);
		return playlist;
	}

	async getByName(name: string, guildId: string) {
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

	// async deleteByName(name: string, guildId: string) {
	// 	const playlist = await this.playlistRepository.findOne({
	// 		where: { name, guildId },
	// 	});

	// 	if (!playlist) {
	// 		throw new Error(`Playlist "${name}" not found`);
	// 	}

	// 	await this.playlistRepository.remove(playlist);

	// 	this.logger.log(`Deleted playlist "${name}" for guild "${guildId}"`);
	// }

	async getForGuild(guildId: string, started = false) {
		const playlists = await this.playlistRepository.find({
			where: { guildId, status: started ? "started" : undefined },
		});

		this.logger.debug(`Retrieved playlists for guild "${guildId}"`);

		return playlists;
	}

	// async getStartedPlaylistsForGuild(guildId: string) {
	// 	const playlists = await this.playlistRepository.find({
	// 		where: { guildId, status: "started" },
	// 	});

	// 	this.logger.debug(`Retrieved started playlists for guild "${guildId}"`);

	// 	return playlists;
	// }

	async getDownloadLink(playlistId: string) {
		const playlist = await this.playlistRepository.findOne({
			where: { id: playlistId },
		});

		if (playlist!.status === "started") {
			await this.renderQueue.add(TOPIC_RENDER, new RenderEvent(playlist!.id));
			await this.playlistRepository.update(playlist!.id, {
				status: "rendering",
			});
			throw new Error(PLAYLIST_NOT_READY);
		}

		if (playlist!.status === "rendering") {
			throw new Error(PLAYLIST_NOT_READY);
		}

		return await this.playlistStorageService.getPresignedUrl(playlist!.id);
	}
}
