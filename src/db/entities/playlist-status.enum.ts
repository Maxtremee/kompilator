/**
 * started - The playlist has been created and is open for adding items.
 * rendering - The playlist is being rendered and is closed for adding items.
 * finished - The playlist has been closed for adding items.
 */
export const PlaylistStatus = ["started", "finished", "rendering"] as const;
export type PlaylistStatus = (typeof PlaylistStatus)[number];
