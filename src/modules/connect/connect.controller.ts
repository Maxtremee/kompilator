import {
	Body,
	Controller,
	HttpException,
	HttpStatus,
	Logger,
	Post,
	Res,
} from "@nestjs/common";
import type { Response } from "express";
import { ConfigService } from "@nestjs/config";

@Controller("/")
export class ConnectController {
	private readonly logger = new Logger(ConnectController.name);
	private url: string;

	constructor(private configService: ConfigService) {
		const url = new URL("/oauth2/authorize", "https://discord.com");
		url.searchParams.set(
			"client_id",
			this.configService.get<string>("DISCORD_CLIENT_ID")!,
		);

		this.url = url.toString();

		this.logger.log(`Connection URL: ${this.url}`);
	}

	@Post("connect")
	async connect(@Body() body: { password: string }, @Res() res: Response) {
		if (body.password === this.configService.get<string>("DISCORD_PASSWORD")) {
			this.logger.log("New connection");
			res.redirect(this.url);
		}
		this.logger.error("Invalid password");
		return new HttpException("Invalid password", HttpStatus.FORBIDDEN);
	}
}
