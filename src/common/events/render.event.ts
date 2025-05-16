export const TOPIC_RENDER = "render" as const;

export class RenderEvent {
	constructor(public readonly playlistId: string) {}
}
