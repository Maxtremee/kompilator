import { ColumnOptions } from "typeorm";

export const DateColumnOptions: ColumnOptions = {
	// sqlite does not support timestamptz column type
	type: "text",
	transformer: {
		// when saving to the database, we don't care about the type
		to: (val: unknown) => val,
		// when reading from the database, we want to convert the string to a date
		from: (value: string) => new Date(value),
	},
} as const;
