import {
	Body,
	Controller,
	Get,
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

	constructor(private configService: ConfigService) {}

	@Post("connect")
	async connect(@Body() body: { password: string }, @Res() res: Response) {
		if (body.password === this.configService.get<string>("DISCORD_PASSWORD")) {
			const url = new URL("/oauth2/authorize", "https://discord.com");
			url.searchParams.set(
				"client_id",
				this.configService.get<string>("DISCORD_CLIENT_ID")!,
			);
			this.logger.log("New connection");
			res.redirect(url.toString());
		}
		this.logger.error("Invalid password");
		return new HttpException("Invalid password", HttpStatus.FORBIDDEN);
	}
}
