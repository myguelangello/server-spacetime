/*
  Warnings:

  - You are about to drop the column `coverUrl` on the `memories` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - Added the required column `cover_url` to the `memories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avatar_url` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_memories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_memories" ("content", "created_at", "id", "is_public", "user_id") SELECT "content", "created_at", "id", "is_public", "user_id" FROM "memories";
DROP TABLE "memories";
ALTER TABLE "new_memories" RENAME TO "memories";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "github_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL
);
INSERT INTO "new_users" ("github_id", "id", "login", "name") SELECT "github_id", "id", "login", "name" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_github_id_key" ON "users"("github_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
