import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { QUEUES } from "~/common/queue";
import { RenderEvent, TOPIC_RENDER } from "~/common/events/render.event";
import { PlaylistStorageService } from "./playlist-storage.service";
import { RenderService, VIDEOS_DIRECTORY } from "../render/render.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Playlist } from "~/db/entities/playlist.entity";
import { Repository } from "typeorm";
import { PlaylistItemStorageService } from "../playlist-item/playlist-item-storage.service";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PlaylistStatus } from "~/db/entities/playlist-status.enum";

export type PlaylistJob = Job<RenderEvent, void, typeof TOPIC_RENDER>;

@Processor(QUEUES.RENDER)
export class PlaylistConsumer extends WorkerHost {
	private readonly logger = new Logger(PlaylistConsumer.name);

	constructor(
		@InjectRepository(Playlist)
		private readonly playlistRepository: Repository<Playlist>,
		@Inject(PlaylistItemStorageService)
		private readonly playlistItemStorageService: PlaylistItemStorageService,
		@Inject(PlaylistStorageService)
		private readonly playlistStorageService: PlaylistStorageService,
		@Inject(RenderService)
		private readonly renderService: RenderService,
	) {
		super();
	}

	@OnWorkerEvent("active")
	async onActive(job: PlaylistJob): Promise<void> {
		this.logger.log(`Rendering playlist: ${job.data.playlistId}`);
	}

	@OnWorkerEvent("completed")
	async onCompleted(job: PlaylistJob): Promise<void> {
		// await this.cleanup();
		this.logger.log(`Rendering playlist ${job.data.playlistId} completed`);
	}

	@OnWorkerEvent("failed")
	async onFailed(job: PlaylistJob): Promise<void> {
		// await this.cleanup();
		this.logger.error(`Rendering playlist ${job.data.playlistId} failed`);
	}

	async process(job: PlaylistJob): Promise<void> {
		try {
			const { playlistId } = job.data;

			const playlist = await this.playlistRepository.findOne({
				where: { id: playlistId },
				relations: {
					items: true,
				},
			});

			if (!playlist) {
				throw new Error(`Playlist "${playlistId}" not found`);
			}

			const itemsDir = join(VIDEOS_DIRECTORY, playlist.id);

			// create directory for playlist
			await mkdir(itemsDir, {
				recursive: true,
			});

			// write all clips to file system
			for (const item of playlist.items) {
				const buffer = await this.playlistItemStorageService.get(item.id);
				await writeFile(join(itemsDir, item.id), buffer, {
					flag: "w",
				});
				this.logger.debug(`Wrote item ${item.id} to file system`);
			}

			// render the playlist
			const output = await this.renderService.render(playlist.id);

			// upload the rendered playlist to storage
			await this.playlistStorageService.create(output, playlist.id);

			// update the playlist status
			playlist.status = PlaylistStatus[1];

			// update the playlist in the database
			await this.playlistRepository.save(playlist);

			// delete all items from storage
			for (const item of playlist.items) {
				await this.playlistItemStorageService.delete(item.id);
			}
		} catch (error) {
			this.logger.error(`Error processing playlist: ${error.message}`);
			throw error;
		}
	}

	private async cleanup() {
		this.logger.log("Cleaning up");

		await rm(VIDEOS_DIRECTORY, {
			recursive: true,
		});
		this.logger.debug("All files removed from videos directory");
	}
}
