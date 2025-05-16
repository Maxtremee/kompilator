import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlaylistItem } from "~/db/entities/playlist-item.entity";
import { Playlist } from "~/db/entities/playlist.entity";
import { PlaylistItemStorageService } from "./playlist-item-storage.service";
import { DownloadService } from "../download/download.service";

@Injectable()
export class PlaylistItemService {
	private readonly logger = new Logger(PlaylistItemService.name);

	constructor(
		@InjectRepository(PlaylistItem)
		private readonly playlistItemsRepository: Repository<PlaylistItem>,
		@Inject(PlaylistItemStorageService)
		private readonly playlistItemStorageService: PlaylistItemStorageService,
		@Inject(DownloadService)
		private readonly downloadService: DownloadService,
	) {}

	/**
	 *
	 * synchronously creates a playlist item, downloads the file, saves it to storage, and saves the item to the database
	 * @param playlist
	 * @param url
	 * @returns
	 */
	async create(playlist: Playlist, url: string) {
		let playlistItem = this.playlistItemsRepository.create({
			playlist,
			url,
		});

		playlistItem = await this.playlistItemsRepository.save(playlistItem);

		try {
			const downloaded = await this.downloadService.download(url);

			await this.playlistItemStorageService.create(downloaded, playlistItem.id);
		} catch (error) {
			await this.playlistItemsRepository.delete(playlistItem.id);
			throw error;
		}

		this.logger.log(
			`Added URL "${url}" to playlist "${playlist.id}" for guild "${playlist.guildId}"`,
		);

		return playlistItem;
	}

	async get(id: string) {
		const playlistItem = await this.playlistItemsRepository.findOne({
			where: { id },
		});
		if (!playlistItem) {
			throw new Error(`Playlist item "${id}" not found`);
		}
		return playlistItem;
	}

	// async delete(playlistId: string, guildId: string, url: string) {
	// 	const playlist = await this.playlistRepository.findOne({
	// 		where: { id: playlistId, guildId },
	// 	});

	// 	if (!playlist) {
	// 		throw new Error(`Playlist "${playlistId}" not found`);
	// 	}

	// 	const playlistItem = await this.playlistItemsRepository.findOne({
	// 		where: { playlist, url },
	// 	});

	// 	if (!playlistItem) {
	// 		throw new Error(`Playlist item "${url}" not found`);
	// 	}

	// 	// schedule item to delete and remove it from the playlist
	// 	playlistItem.playlist = undefined;
	// 	await this.playlistItemsRepository.save(playlistItem);

	// 	this.logger.log(
	// 		`Removed URL "${url}" from playlist "${playlistId}" for guild "${guildId}"`,
	// 	);

	// 	return playlistItem;
	// }

	// cleanup all playlist items that are in a finished playlist
	@Cron(CronExpression.EVERY_12_HOURS)
	private async cleanup() {
		this.logger.log("Cleanup started");

		const itemsToDelete = await this.playlistItemsRepository.find({
			where: {
				playlist: {
					status: "finished",
				},
			},
		});

		this.logger.log(`Deleting ${itemsToDelete.length} playlist items`);

		// remove files
		for (const item of itemsToDelete) {
			await this.playlistItemStorageService.delete(item.id);
		}

		this.logger.log("Cleanup finished");
	}
}
