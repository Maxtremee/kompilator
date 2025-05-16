import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client as MinioClient } from "minio";

const ITEMS_BUCKET = "items";
const PLAYLISTS_BUCKET = "playlists";

@Injectable()
export class StorageService {
	private readonly logger = new Logger(StorageService.name);
	private readonly client: MinioClient;

	constructor(private readonly configService: ConfigService) {
		this.client = new MinioClient({
			endPoint: this.configService.getOrThrow<string>("S3_URL"),
			port: this.configService.getOrThrow<number>("S3_PORT"),
			useSSL: this.configService.getOrThrow<string>("S3_SSL") === "true",
			accessKey: this.configService.getOrThrow<string>("S3_ACCESS_KEY"),
			secretKey: this.configService.getOrThrow<string>("S3_SECRET_KEY"),
		});
	}

	public async getItem(name: string): Promise<Buffer> {
		await this.getBucket(ITEMS_BUCKET);
		const stream = await this.client.getObject(ITEMS_BUCKET, name);
		const chunks: Buffer[] = [];
		for await (const chunk of stream) {
			chunks.push(chunk);
		}
		return Buffer.concat(chunks);
	}

	public async saveItem(buffer: Buffer, name: string) {
		await this.getBucket(ITEMS_BUCKET);

		await this.client.putObject(ITEMS_BUCKET, name, buffer, buffer.length);
	}

	public async getPlaylist(name: string): Promise<Buffer> {
		await this.getBucket(PLAYLISTS_BUCKET);
		const stream = await this.client.getObject(PLAYLISTS_BUCKET, name);
		const chunks: Buffer[] = [];
		for await (const chunk of stream) {
			chunks.push(chunk);
		}
		return Buffer.concat(chunks);
	}

	public async savePlaylist(buffer: Buffer, name: string) {
		await this.getBucket(PLAYLISTS_BUCKET);
		await this.client.putObject(PLAYLISTS_BUCKET, name, buffer, buffer.length, {
			"Content-Type": "video/mp4",
		});
	}

	private async getBucket(bucket: string) {
		const exists = await this.client.bucketExists(bucket);
		if (!exists) {
			await this.client.makeBucket(bucket, "us-east-1");
			this.logger.log(`Bucket "${bucket}" created`);
		} else {
			this.logger.log(`Bucket "${bucket}" already exists`);
		}
	}
}
