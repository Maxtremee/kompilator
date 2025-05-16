import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";

type CobaltPicker = {
	type: "photo" | "video" | "gif";
	url: string;
	thumb?: string;
};

type CobaltResponse =
	| {
			status: "tunnel" | "redirect";
			url: string;
			filename: string;
	  }
	| {
			status: "picker";
			audio?: string;
			audioFilename?: string;
			picker: CobaltPicker[];
	  }
	| {
			status: "error";
			error: object;
	  };

@Injectable()
export class DownloadService {
	private readonly logger = new Logger(DownloadService.name);
	private readonly url: string;

	public constructor(private configService: ConfigService) {
		this.url = this.configService.getOrThrow<string>("COBALT_URL");
	}

	public async download(url: string): Promise<Buffer> {
		this.logger.debug(`Downloading ${url}`);

		try {
			const res = await axios.post<CobaltResponse>(
				this.url,
				{
					url,
				},
				{
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
				},
			);

			if (res.data.status === "error") {
				throw new Error(`Cobalt error: ${JSON.stringify(res.data.error)}`);
			}

			if (res.data.status === "tunnel") {
				this.logger.debug(`Tunnel response: ${JSON.stringify(res.data)}`);
				const tunnel = await axios.get<Buffer>(res.data.url, {
					responseType: "arraybuffer",
				});
				return Buffer.from(tunnel.data);
			}

			if (res.data.status === "redirect") {
				this.logger.debug(`Redirect response: ${JSON.stringify(res.data)}`);
				const redirect = await axios.get<Buffer>(res.data.url, {
					responseType: "arraybuffer",
				});
				return Buffer.from(redirect.data);
			}

			if (res.data.status === "picker") {
				this.logger.debug(`Picker response: ${JSON.stringify(res.data)}`);
				const picker = res.data.picker.find((p) => p.type === "video");
				if (picker) {
					const video = await axios.get<Buffer>(picker.url, {
						responseType: "arraybuffer",
					});
					return Buffer.from(video.data);
				}
			}

			this.logger.error(`Unknown response: ${JSON.stringify(res.data)}`);
			throw new Error(`Unknown response: ${JSON.stringify(res.data)}`);
		} catch (error) {
			this.logger.error(`Error downloading ${url}: ${error}`);
			throw error;
		}
	}
}
