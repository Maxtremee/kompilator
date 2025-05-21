# kompilator

**Kompilator** ("compiler" in Polish) is a Discord bot able to create and manage playlists of short clips from the Internet and export them to a single video, often called a "compilation" (hence the name).

## Features

- Create and manage playlists of short clips from the Internet
- Export playlists to a single video
- Support for various video sources (YouTube, Twitch, etc.)
- Support for various video formats
- Support for various video resolutions

## Usage

In order to use the bot, you need to create your own Discord bot and invite it to your server. You can do this in [Discord Developer Portal](https://discord.com/developers/applications).

The app expects 3 other components to work:

- [Redis](https://redis.io/)
- [Cobalt](https://github.com/imputnet/cobalt)
- any S3 compatible storage (e.g. [MinIO](https://min.io/), [AWS S3](https://aws.amazon.com/s3/), etc.)

For a simple deployment, you can use [docker-compose](https://docs.docker.com/compose/) to run all components. The [local.yml](docker/local.yaml) file is provided in the repository as a starting point. [env.example](.env.example) file is provided as a template for your environment variables. You can copy it to `.env` and fill in the values.
