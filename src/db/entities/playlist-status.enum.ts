export const PlaylistStatus = ["started", "finished", "rendering"] as const;
export type PlaylistStatus = (typeof PlaylistStatus)[number];
