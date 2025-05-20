import { StringOption } from "necord";

export const PLAYLIST_NAME_FIELD = "name" as const;
export const PLAYLIST_NAME_STARTED_FIELD = "playlist" as const;

export class PlaylistNameDto {
	@StringOption({
		name: PLAYLIST_NAME_FIELD,
		description: "Playlist name",
		required: true,
		min_length: 3,
		max_length: 255,
	})
	name: string;
}

export class PlaylistNameAutocompleteDto {
	@StringOption({
		name: PLAYLIST_NAME_FIELD,
		description: "Playlist name",
		required: true,
		autocomplete: true,
	})
	name: string;
}

export class PlaylistItemDto {
	@StringOption({
		name: PLAYLIST_NAME_STARTED_FIELD,
		description: "Playlist name",
		required: true,
		autocomplete: true,
	})
	name: string;

	@StringOption({
		name: "url",
		description: "URL to add to the playlist",
		required: true,
		min_length: 3,
		max_length: 4000,
	})
	url: string;
}
