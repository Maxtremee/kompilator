import { env } from "../env";
import { client } from "./client";

export function start() {
	client.login(env.DISCORD_TOKEN);
}
