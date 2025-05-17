import { ColumnOptions } from "typeorm";

export const DateColumnOptions: ColumnOptions = {
	// sqlite does not support timestamptz column type
	type: "text",
	// by default typeorm uses YYYY-MM-DD HH:mm:ss which is inferior to ISO 8601
	default: new Date().toISOString(),
	transformer: {
		// when saving to the database, we don't care about the type
		to: (val: unknown) => val,
		// when reading from the database, we want to convert the string to a date
		from: (value: string): Date => new Date(value),
	},
} as const;
