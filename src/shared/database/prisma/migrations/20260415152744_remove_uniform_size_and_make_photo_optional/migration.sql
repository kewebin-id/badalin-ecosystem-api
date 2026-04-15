/*
  Warnings:

  - You are about to drop the column `uniform_size` on the `pilgrims` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pilgrims" DROP COLUMN "uniform_size",
ALTER COLUMN "photo_url" DROP NOT NULL;
