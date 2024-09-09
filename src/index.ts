import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";

new Elysia()
	.use(
		staticPlugin({
			prefix: "",
		}),
	)
	.post(
		"/connect",
		({ body, redirect, error }) => {
			if (body.password === process.env.DISCORD_PASSWORD) {
				const url = new URL("/oauth2/authorize", "https://discord.com");
				url.searchParams.set(
					"client_id",
					process.env.DISCORD_CLIENT_ID as string,
				);
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
	.listen(process.env.PORT || 3000);
