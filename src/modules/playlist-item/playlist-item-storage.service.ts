import { Inject, Injectable, Logger } from "@nestjs/common";
import { BUCKETS, StorageService } from "../storage/storage.service";

@Injectable()
export class PlaylistItemStorageService {
	private readonly logger = new Logger(PlaylistItemStorageService.name);

	constructor(
		@Inject(StorageService) private readonly storageService: StorageService,
	) {}

	public async get(name: string): Promise<Buffer> {
		await this.storageService.getBucket(BUCKETS.ITEMS);
		const stream = await this.storageService.client.getObject(
			BUCKETS.ITEMS,
			name,
		);
		const chunks: Buffer[] = [];
		for await (const chunk of stream) {
			chunks.push(chunk);
		}
		return Buffer.concat(chunks);
	}

	public async create(buffer: Buffer, name: string) {
		await this.storageService.getBucket(BUCKETS.ITEMS);
		await this.storageService.client.putObject(
			BUCKETS.ITEMS,
			name,
			buffer,
			buffer.length,
		);
	}

	public async delete(name: string) {
		await this.storageService.getBucket(BUCKETS.ITEMS);
		await this.storageService.client.removeObject(BUCKETS.ITEMS, name);
		this.logger.log(`Deleted file for item "${name}"`);
	}
}
