import { readdir, open } from "node:fs/promises";
import path from "node:path";
import ffmpeg from "fluent-ffmpeg";
import { logger } from "..";

const DIRECTORY = "playlists" as const;
const AUDIO_BITRATE = 128 as const;
// 25MiB to kBit
const TARGET_SIZE = 25 * 8388.608;
const INTERMEDIATE_FILE_FORMAT = "mkv" as const;
const OUTPUT_FILE_FORMAT = "mp4" as const;

async function getFiles(directoryPath: string) {
	const fileNames = await readdir(directoryPath);
	return fileNames.map((file) => path.join(directoryPath, file));
}

async function getVideoMetadata(path: string) {
	return new Promise<ffmpeg.FfprobeData>((res, rej) => {
		ffmpeg.ffprobe(path, (err, data) => {
			if (err) {
				rej(err);
			}
			if (data) {
				res(data);
			}
		});
	});
}

function getBitrate(size: number, duration: number): number {
	// -200 for good measure
	return size / duration - AUDIO_BITRATE - 200;
}

async function merge(videos: string[], fileName: string): Promise<void> {
	logger.info("Begin merging");

	try {
		const file = await open(`${fileName}.${INTERMEDIATE_FILE_FORMAT}`);
		if (file) {
			logger.info("File already exists, skipping merging");
			return;
		}
	} catch (e) {
		// continue
	}

	const inputArgs = videos.flatMap((video) => ["-i", video]);
	const cmd = [
		"ffmpeg",
		"-y",
		...inputArgs,
		"-filter_complex",
		`[0:v:0][0:a:0][1:v:0][1:a:0][2:v:0][2:a:0]concat=n=${videos.length}:v=1:a=1[outv][outa]`,
		"-map",
		"[outv]",
		"-map",
		"[outa]",
		"-c:v",
		"libx265",
		"-preset",
		"medium",
		"-c:a",
		"aac",
		`${fileName}.${INTERMEDIATE_FILE_FORMAT}`,
	];

	const process = Bun.spawn(cmd);
	const exitCode = await process.exited;
	if (exitCode !== 0) {
		throw new Error("Merging error");
	}

	logger.info("Merging finished");
}

async function compress(input: string, output: string, targetBitrate: number) {
	logger.info("Begin compressing");

	try {
		const file = await open(`${output}.${OUTPUT_FILE_FORMAT}`);
		if (file) {
			logger.info("File already exists, skipping compression");
			return;
		}
	} catch (e) {
		// continue
	}

	const cmd = [
		"ffmpeg",
		"-y",
		"-i",
		`${input}.${INTERMEDIATE_FILE_FORMAT}`,
		"-c:v",
		"libx265",
		"-preset",
		"medium",
		"-b:v",
		`${targetBitrate}k`,
		"-pass",
		"1",
		"-c:a",
		"aac",
		"-b:a",
		"128k",
		"-f",
		"mp4",
		"/dev/null",
	];

	const cmd2 = [
		"ffmpeg",
		"-i",
		`${input}.${INTERMEDIATE_FILE_FORMAT}`,
		"-c:v",
		"libx265",
		"-preset",
		"medium",
		"-b:v",
		`${targetBitrate}k`,
		"-pass",
		"2",
		"-c:a",
		"aac",
		"-b:a",
		"128k",
		`${output}.${OUTPUT_FILE_FORMAT}`,
	];

	const process = Bun.spawn(cmd);
	const exitCode = await process.exited;
	if (exitCode !== 0) {
		throw new Error("Compression error");
	}
	const process2 = Bun.spawn(cmd2);
	const exitCode2 = await process2.exited;
	if (exitCode2 !== 0) {
		throw new Error("Compression error");
	}
	logger.info("Compression finished");
}

export async function render(playlist: string) {
	try {
		const videos = await getFiles(path.join(DIRECTORY, playlist));

		await merge(videos, "output");

		const metadata = await Promise.all(videos.map(getVideoMetadata));
		const bitrate = getBitrate(
			TARGET_SIZE,
			metadata.reduce((acc, video) => acc + (video.format.duration || 0), 0),
		);

		await compress("output", "compressed", bitrate);

		logger.info(`Finished rendering ${playlist}`);
	} catch (e) {
		logger.error(`BAILING on ${playlist}!!!`);
		logger.error(e);
	}
}
