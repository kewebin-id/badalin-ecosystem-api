/*
  Warnings:

  - You are about to drop the column `agency_id` on the `manifests` table. All the data in the column will be lost.
  - You are about to drop the column `agency_id` on the `pilgrims` table. All the data in the column will be lost.
  - You are about to drop the column `agency_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `agency_id` on the `visa_submissions` table. All the data in the column will be lost.
  - Added the required column `agency_slug` to the `manifests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agency_slug` to the `pilgrims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agency_slug` to the `visa_submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "manifests" DROP CONSTRAINT "manifests_agency_id_fkey";

-- DropForeignKey
ALTER TABLE "pilgrims" DROP CONSTRAINT "pilgrims_agency_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_agency_id_fkey";

-- DropForeignKey
ALTER TABLE "visa_submissions" DROP CONSTRAINT "visa_submissions_agency_id_fkey";

-- AlterTable
ALTER TABLE "manifests" DROP COLUMN "agency_id",
ADD COLUMN     "agency_slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pilgrims" DROP COLUMN "agency_id",
ADD COLUMN     "agency_slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "agency_id",
ADD COLUMN     "agency_slug" TEXT;

-- AlterTable
ALTER TABLE "visa_submissions" DROP COLUMN "agency_id",
ADD COLUMN     "agency_slug" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_agency_slug_fkey" FOREIGN KEY ("agency_slug") REFERENCES "agencies"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pilgrims" ADD CONSTRAINT "pilgrims_agency_slug_fkey" FOREIGN KEY ("agency_slug") REFERENCES "agencies"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_submissions" ADD CONSTRAINT "visa_submissions_agency_slug_fkey" FOREIGN KEY ("agency_slug") REFERENCES "agencies"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_agency_slug_fkey" FOREIGN KEY ("agency_slug") REFERENCES "agencies"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
