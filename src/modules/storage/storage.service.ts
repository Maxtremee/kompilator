import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client as MinioClient } from "minio";

export const BUCKETS = {
	ITEMS: "items",
	PLAYLISTS: "playlists",
} as const;

@Injectable()
export class StorageService {
	private readonly logger = new Logger(StorageService.name);
	readonly client: MinioClient;

	constructor(private readonly configService: ConfigService) {
		this.client = new MinioClient({
			endPoint: this.configService.getOrThrow<string>("S3_URL"),
			port: this.configService.getOrThrow<number>("S3_PORT"),
			useSSL: this.configService.getOrThrow<string>("S3_SSL") === "true",
			accessKey: this.configService.getOrThrow<string>("S3_ACCESS_KEY"),
			secretKey: this.configService.getOrThrow<string>("S3_SECRET_KEY"),
		});
	}

	async getBucket(bucket: (typeof BUCKETS)[keyof typeof BUCKETS]) {
		const exists = await this.client.bucketExists(bucket);
		if (!exists) {
			await this.client.makeBucket(bucket, "us-east-1");
			this.logger.debug(`Bucket "${bucket}" created`);
		} else {
			this.logger.debug(`Bucket "${bucket}" already exists`);
		}
	}
}
