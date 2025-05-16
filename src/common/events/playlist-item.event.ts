export const TOPIC_PLAYLIST_ITEM = "item.download" as const;

export class PlaylistItemEvent {
	constructor(public readonly id: string) {}
}
