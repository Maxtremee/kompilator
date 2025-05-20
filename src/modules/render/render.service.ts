import { mkdir, open, readFile, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { Injectable, Logger } from "@nestjs/common";
import * as ffmpeg from "fluent-ffmpeg";

// MISC
export const VIDEOS_DIRECTORY = "data/videos" as const;
const MERGED_DIRECTORY = "data/merged" as const;
const OUTPUT_DIRECTORY = "data/output" as const;
// 25MiB to kBit
const TARGET_SIZE = 25 * 8388.608;
const PRESET = "medium" as const;

// VIDEO
const VIDEO_CODEC = "libx265" as const;
export const OUTPUT_FILE_FORMAT = "mp4" as const;
const INTERMEDIATE_FILE_FORMAT = "mkv" as const;

// AUDIO
const AUDIO_CODEC = "aac" as const;
const AUDIO_BITRATE = 128 as const;

@Injectable()
export class RenderService {
	private readonly logger = new Logger(RenderService.name);

	/**
	 *
	 * @param playlist ID of the playlist to render; videos have to downloaded at this point
	 * @returns path to the rendered video
	 */
	async render(playlist: string): Promise<Buffer> {
		this.logger.log(`Rendering playlist ${playlist}`);

		const merged = await this.merge(playlist);

		const compressed = await this.compress(merged, playlist);

		const buffer = await readFile(compressed);

		this.logger.log(`Rendering finished for ${playlist}`);

		return buffer;
	}

	async prepare() {
		this.logger.debug("Preparing for render");

		const videosDir = join(VIDEOS_DIRECTORY);
		const mergedDir = join(MERGED_DIRECTORY);
		const outputDir = join(OUTPUT_DIRECTORY);

		const dirs = [videosDir, mergedDir, outputDir];

		// remove directories
		for (const dir of dirs) {
			await rm(dir, {
				recursive: true,
				force: true,
			});
			this.logger.debug(`Removed directory: ${dir}`);
		}

		// Create directories
		for (const dir of dirs) {
			await mkdir(dir, { recursive: true });
			this.logger.debug(`Created directory: ${dir}`);
		}

		this.logger.debug("Preparing for render finished");
	}

	async cleanup() {
		this.logger.debug("Cleanup after render");

		const videosDir = join(VIDEOS_DIRECTORY);
		const mergedDir = join(MERGED_DIRECTORY);
		const outputDir = join(OUTPUT_DIRECTORY);

		const dirs = [videosDir, mergedDir, outputDir];

		for (const dir of dirs) {
			await rm(dir, {
				recursive: true,
				force: true,
			});
			this.logger.debug(`Removed directory: ${dir}`);
		}

		this.logger.debug("Cleanup after render finished");
	}

	private async merge(playlist: string): Promise<string> {
		this.logger.log("Begin merging");

		const outputFilename = `${playlist}.${INTERMEDIATE_FILE_FORMAT}`;
		const output = join(MERGED_DIRECTORY, outputFilename);

		try {
			const file = await open(output, "r");
			if (file) {
				this.logger.warn(`File ${playlist} already exists, skipping merging`);
				await file.close();
				return output;
			}
		} catch {
			// continue
		}

		const videos = await this.getFilenames(playlist);
		const { width, height } = await this.getDimensions(playlist);

		const getAVFilter = (i: number) =>
			`[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease:eval=frame,pad=${width}:${height}:-1:-1:color=black[v${i}]; `;

		const scaleInput = videos.map((_, i) => getAVFilter(i)).join("");
		const avInput = videos.map((_, i) => `[v${i}][${i}:a]`).join("");

		await new Promise<void>((resolve, reject) => {
			let cmd = ffmpeg();

			cmd = videos.reduce((acc, video) => acc.input(video), cmd);

			cmd = cmd
				// overwrite output file
				.addOption("-y")
				// concat videos with different formats
				.addOption(
					"-filter_complex",
					`${scaleInput}${avInput}concat=n=${videos.length}:v=1:a=1[v][a]`,
				)
				.map("[v]")
				.map("[a]")
				.addOption("-c:v", VIDEO_CODEC)
				.addOption("-c:a", AUDIO_CODEC)
				.addOption("-preset", PRESET)
				.on("start", () => {
					this.logger.log(`Merging started for ${playlist}`);
				})
				.on("end", () => {
					this.logger.log(`Processing finished for ${playlist}`);
					resolve();
				})
				.on("error", (err) => {
					this.logger.log(`An error occurred during merging ${playlist}`);
					reject(err);
				})
				.output(output);

			this.logger.debug(`Merging command: ${cmd._getArguments()}`);

			cmd.run();
		});

		return output;
	}

	/**
	 * Compressing requires rendering process to run twice,
	 * hence "pass" option
	 */
	private async compress(merged: string, playlist: string): Promise<string> {
		const outputFilename = `${playlist}.${OUTPUT_FILE_FORMAT}`;
		const output = join(OUTPUT_DIRECTORY, outputFilename);

		try {
			const file = await open(output, "r");
			if (file) {
				this.logger.warn(
					`File ${playlist} already exists, skipping compression`,
				);
				await file.close();
				return output;
			}
		} catch {
			// continue
		}

		const bitrate = await this.getBitrate(playlist);

		await new Promise((resolve, reject) => {
			const cmd = ffmpeg()
				.input(merged)
				.addOption("-y")
				.addOption("-preset", PRESET)
				.addOption("-c:v", VIDEO_CODEC)
				.addOption("-c:a", AUDIO_CODEC)
				.addOption("-pass", "1")
				.videoBitrate(bitrate)
				.audioBitrate(`${AUDIO_BITRATE}k`)
				.format(OUTPUT_FILE_FORMAT)
				.on("start", () => {
					this.logger.log(`Compression pass 1 started for ${playlist}`);
				})
				.on("end", () => {
					this.logger.log(`Compression pass 1 finished for ${playlist}`);
					resolve(0);
				})
				.on("error", (err) => {
					this.logger.log(
						`An error occurred during compression pass 1 for ${playlist}`,
					);
					reject(err);
				})
				.output("/dev/null");

			cmd.run();
		});

		await new Promise<void>((resolve, reject) => {
			const cmd = ffmpeg()
				.input(merged)
				.addOption("-y")
				.addOption("-preset", PRESET)
				.addOption("-c:v", VIDEO_CODEC)
				.addOption("-c:a", AUDIO_CODEC)
				.addOption("-pass", "2")
				.videoBitrate(bitrate)
				.audioBitrate(`${AUDIO_BITRATE}k`)
				.format(OUTPUT_FILE_FORMAT)
				.on("start", () => {
					this.logger.log(`Compression pass 2 started for ${playlist}`);
				})
				.on("end", () => {
					this.logger.log(`Compression pass 2 finished for ${playlist}`);
					resolve();
				})
				.on("error", (err) => {
					this.logger.log(
						`An error occurred during compression pass 2 for ${playlist}`,
					);
					reject(err);
				})
				.output(output);

			cmd.run();
		});

		return output;
	}

	private async getFilenames(playlist: string) {
		const dir = join(VIDEOS_DIRECTORY, playlist);
		return (await readdir(dir)).map((file) => join(dir, file));
	}

	private async getMetadata(playlist: string) {
		const videos = await this.getFilenames(playlist);
		const metadata = (video: string) =>
			new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
				ffmpeg.ffprobe(video, (err, data) => {
					if (err) {
						reject(err);
					}
					if (data) {
						resolve(data);
					}
				});
			});
		const videosWithMetadata = await Promise.all(videos.map(metadata));
		return videosWithMetadata;
	}

	private async getDuration(playlist: string): Promise<number> {
		const videosWithMetadata = await this.getMetadata(playlist);

		return videosWithMetadata.reduce(
			(acc, video) => acc + (video.format.duration || 0),
			0,
		);
	}

	private async getBitrate(playlist: string): Promise<number> {
		const duration = await this.getDuration(playlist);
		// -200 for good measure
		return TARGET_SIZE / duration - AUDIO_BITRATE - 200;
	}

	private async getDimensions(
		playlist: string,
	): Promise<{ width: number; height: number }> {
		const videosWithMetadata = await this.getMetadata(playlist);

		const width = Math.max(
			...videosWithMetadata.map((video) => video.streams[0].width || 0),
		);
		const height = Math.max(
			...videosWithMetadata.map((video) => video.streams[0].height || 0),
		);

		return { width, height };
	}
}
