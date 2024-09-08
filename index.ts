import { readdir, open } from 'node:fs/promises';
import { join } from 'node:path';
import ffmpeg from 'fluent-ffmpeg';

const DIRECTORY = 'test-videos' as const;
const AUDIO_BITRATE = 128 as const;
// 25MiB to kBit
const TARGET_SIZE = 25 * 8388.608
const OUTPUT_FILE_FORMAT = 'mp4' as const

async function getFiles(directoryPath: string) {
  const fileNames = await readdir(directoryPath);
  return fileNames.map(file => join(directoryPath, file));
}

async function getVideoMetadata(path: string): Promise<ffmpeg.FfprobeData> {
  return new Promise<ffmpeg.FfprobeData>((res, rej) => {
    ffmpeg.ffprobe(path, (err, data) => {
      if (err) {
        rej(err)
      }
      if (data) {
        res(data)
      }
    })
  })
}

function getBitrate(size: number, duration: number): number {
  // -200 for good measure
  return (size / duration) - AUDIO_BITRATE - 200;
}

async function merge(videos: string[], fileName: string): Promise<void> {
  console.log('Begin merging')

  try {
    const file = await open(`${fileName}.mkv`)
    if (file) {
      console.log('File exists, skipping...')
      return
    }
  } catch (e) {
    // continue
  }

  const inputArgs = videos.map((video) => ['-i', video]).flat()
  const cmd = ['ffmpeg', '-y', ...inputArgs, '-filter_complex', `[0:v:0][0:a:0][1:v:0][1:a:0][2:v:0][2:a:0]concat=n=${videos.length}:v=1:a=1[outv][outa]`, '-map', "[outv]", '-map', "[outa]", '-c:v', 'libx265', '-preset', 'medium', '-c:a', 'aac', `${fileName}.mkv`]

  const process = Bun.spawn(cmd)
  const exitCode = await process.exited;
  if (exitCode != 0) {
    throw new Error('Merging error')
  }

  console.log('Merging finished')
}

async function compress(inputName: string, outputName: string, targetBitrate: number) {
  console.log('Begin compressing')

  try {
    const file = await open(`${outputName}.${OUTPUT_FILE_FORMAT}`)
    if (file) {
      console.log('File exists, skipping...')
      return
    }
  } catch (e) {
    // continue
  }

  const cmd = ['ffmpeg', '-y', '-i', `${inputName}.mkv`, '-c:v', 'libx265', '-preset', 'medium', '-b:v', `${targetBitrate}k`, '-pass', '1', '-c:a', 'aac', '-b:a', '128k', '-f', 'mp4', '/dev/null']

  const cmd2 = ['ffmpeg', '-i', `${inputName}.mkv`, '-c:v', 'libx265', '-preset', 'medium', '-b:v', `${targetBitrate}k`, '-pass', '2', '-c:a', 'aac', '-b:a', '128k', `${outputName}.${OUTPUT_FILE_FORMAT}`]

  const process = Bun.spawn(cmd);
  const exitCode = await process.exited;
  if (exitCode != 0) {
    throw new Error('Compression error')
  }
  const process2 = Bun.spawn(cmd2);
  const exitCode2 = await process2.exited;
  if (exitCode2 != 0) {
    throw new Error('Compression error')
  }
  console.log('Compression finished')
}

async function run() {
  try {
    const videos = await getFiles(DIRECTORY)

    await merge(videos, 'output')

    const metadata = await Promise.all(videos.map(getVideoMetadata));
    const bitrate = getBitrate(TARGET_SIZE, metadata.reduce((acc, video) => acc + (video.format.duration || 0), 0))

    await compress('output', 'compressed', bitrate)
  } catch (e) {
    console.error('BAILING!!!')
    console.error(e)
  }
}

run()