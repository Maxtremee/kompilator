import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { logger } from "..";
import { env } from "../env";

export function start() {
	return new Elysia()
		.use(logger.into())
		.onError((ctx) => {
			logger.error(ctx, ctx.error.name);
			return "onError";
		})
		.use(
			staticPlugin({
				prefix: "",
			}),
		)
		.post(
			"/connect",
			({ body, redirect, error }) => {
				if (body.password === env.DISCORD_PASSWORD) {
					const url = new URL("/oauth2/authorize", "https://discord.com");
					url.searchParams.set("client_id", env.DISCORD_CLIENT_ID);
					return redirect(url.toString());
				}
				return error(403);
			},
			{
				type: "multipart/form-data",
				body: t.Object({
					password: t.String(),
				}),
			},
		)
		.listen(env.PORT || 3000);
}
