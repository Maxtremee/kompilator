import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1747510927859 implements MigrationInterface {
	name = "Migrations1747510927859";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "playlist" ("id" varchar PRIMARY KEY NOT NULL, "createdAt" text NOT NULL DEFAULT ('2025-05-17T19:42:08.015Z'), "updatedAt" text NOT NULL DEFAULT ('2025-05-17T19:42:08.015Z'), "name" varchar(255) NOT NULL, "guildId" varchar(255) NOT NULL, "status" varchar CHECK( "status" IN ('started','finished','rendering') ) NOT NULL DEFAULT ('started'))`,
		);
		await queryRunner.query(
			`CREATE TABLE "playlist_item" ("id" varchar PRIMARY KEY NOT NULL, "createdAt" text NOT NULL DEFAULT ('2025-05-17T19:42:08.015Z'), "updatedAt" text NOT NULL DEFAULT ('2025-05-17T19:42:08.015Z'), "url" varchar(4096) NOT NULL, "playlistId" varchar)`,
		);
		await queryRunner.query(
			`CREATE TABLE "temporary_playlist_item" ("id" varchar PRIMARY KEY NOT NULL, "createdAt" text NOT NULL DEFAULT ('2025-05-17T19:42:08.015Z'), "updatedAt" text NOT NULL DEFAULT ('2025-05-17T19:42:08.015Z'), "url" varchar(4096) NOT NULL, "playlistId" varchar, CONSTRAINT "FK_9b9b229772d88966e7d9959d907" FOREIGN KEY ("playlistId") REFERENCES "playlist" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
		);
		await queryRunner.query(
			`INSERT INTO "temporary_playlist_item"("id", "createdAt", "updatedAt", "url", "playlistId") SELECT "id", "createdAt", "updatedAt", "url", "playlistId" FROM "playlist_item"`,
		);
		await queryRunner.query(`DROP TABLE "playlist_item"`);
		await queryRunner.query(
			`ALTER TABLE "temporary_playlist_item" RENAME TO "playlist_item"`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "playlist_item" RENAME TO "temporary_playlist_item"`,
		);
		await queryRunner.query(
			`CREATE TABLE "playlist_item" ("id" varchar PRIMARY KEY NOT NULL, "createdAt" text NOT NULL DEFAULT ('2025-05-17T19:42:08.015Z'), "updatedAt" text NOT NULL DEFAULT ('2025-05-17T19:42:08.015Z'), "url" varchar(4096) NOT NULL, "playlistId" varchar)`,
		);
		await queryRunner.query(
			`INSERT INTO "playlist_item"("id", "createdAt", "updatedAt", "url", "playlistId") SELECT "id", "createdAt", "updatedAt", "url", "playlistId" FROM "temporary_playlist_item"`,
		);
		await queryRunner.query(`DROP TABLE "temporary_playlist_item"`);
		await queryRunner.query(`DROP TABLE "playlist_item"`);
		await queryRunner.query(`DROP TABLE "playlist"`);
	}
}
