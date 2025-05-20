import { Inject, Injectable, Logger } from "@nestjs/common";
import { OUTPUT_FILE_FORMAT } from "../render/render.service";
import { BUCKETS, StorageService } from "../storage/storage.service";

@Injectable()
export class PlaylistStorageService {
	private readonly logger = new Logger(PlaylistStorageService.name);

	constructor(
		@Inject(StorageService) private readonly storageService: StorageService,
	) {}

	// public async get(name: string): Promise<Buffer> {
	// 	await this.storageService.getBucket(BUCKETS.PLAYLISTS);
	// 	const stream = await this.storageService.client.getObject(
	// 		BUCKETS.PLAYLISTS,
	// 		name,
	// 	);
	// 	const chunks: Buffer[] = [];
	// 	for await (const chunk of stream) {
	// 		chunks.push(chunk);
	// 	}
	// 	return Buffer.concat(chunks);
	// }

	public async getPresignedUrl(name: string): Promise<string> {
		await this.storageService.getBucket(BUCKETS.PLAYLISTS);
		const url = await this.storageService.client.presignedGetObject(
			BUCKETS.PLAYLISTS,
			`${name}.${OUTPUT_FILE_FORMAT}`,
			60 * 60 * 24, // 1 day
		);
		this.logger.log(`Presigned URL for playlist "${name}" generated`);
		this.logger.debug(`Presigned URL: ${url}`);
		return url;
	}

	public async create(buffer: Buffer, name: string) {
		await this.storageService.getBucket(BUCKETS.PLAYLISTS);
		await this.storageService.client.putObject(
			BUCKETS.PLAYLISTS,
			`${name}.${OUTPUT_FILE_FORMAT}`,
			buffer,
			buffer.length,
			{
				"Content-Type": "video/mp4",
			},
		);
		this.logger.log(`Playlist "${name}" saved to storage`);
	}

	// public async delete(name: string) {
	// 	await this.storageService.getBucket(BUCKETS.PLAYLISTS);
	// 	await this.storageService.client.removeObject(BUCKETS.PLAYLISTS, name);
	// 	this.logger.log(`Deleted file for playlist "${name}"`);
	// }
}
