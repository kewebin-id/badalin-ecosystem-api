/*
  Warnings:

  - The `relation` column on the `pilgrims` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PilgrimRelation" AS ENUM ('SELF', 'SPOUSE', 'FATHER', 'MOTHER', 'CHILD', 'SIBLING');

-- AlterTable
ALTER TABLE "pilgrims" ADD COLUMN     "ktp_url" TEXT,
ADD COLUMN     "passport_url" TEXT,
ADD COLUMN     "photo_url" TEXT,
DROP COLUMN "relation",
ADD COLUMN     "relation" "PilgrimRelation" DEFAULT 'SELF';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "full_name" TEXT,
ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "reset_password_expires" TIMESTAMP(3),
ADD COLUMN     "reset_password_token" TEXT;
