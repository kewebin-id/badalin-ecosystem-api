/*
  Warnings:

  - You are about to drop the column `flight_eta` on the `visa_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `flight_etd` on the `visa_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `hotel_checkin` on the `visa_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `hotel_checkout` on the `visa_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `transport_type` on the `visa_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `trip_route` on the `visa_submissions` table. All the data in the column will be lost.
  - You are about to drop the `manifests` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `pilgrims` will be added. If there are existing duplicate values, this will fail.
  - Made the column `marital_status` on table `pilgrims` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nik` on table `pilgrims` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ktp_url` on table `pilgrims` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passport_url` on table `pilgrims` required. This step will fail if there are existing NULL values in that column.
  - Made the column `photo_url` on table `pilgrims` required. This step will fail if there are existing NULL values in that column.
  - Made the column `relation` on table `pilgrims` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('DBL', 'TRPL', 'QUAD', 'QUINT');

-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('BUS', 'TRAIN', 'TAXI', 'MPV', 'OTHER');

-- CreateEnum
CREATE TYPE "HotelCity" AS ENUM ('MAKKAH', 'MADINAH', 'JEDDAH', 'CITY_OTHER');

-- CreateEnum
CREATE TYPE "FlightType" AS ENUM ('DEPARTURE', 'RETURN', 'OTHER');

-- DropForeignKey
ALTER TABLE "manifests" DROP CONSTRAINT "manifests_agency_slug_fkey";

-- AlterTable
ALTER TABLE "pilgrims" ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "marital_status" SET NOT NULL,
ALTER COLUMN "nik" SET NOT NULL,
ALTER COLUMN "ktp_url" SET NOT NULL,
ALTER COLUMN "passport_url" SET NOT NULL,
ALTER COLUMN "photo_url" SET NOT NULL,
ALTER COLUMN "relation" SET NOT NULL;

-- AlterTable
ALTER TABLE "visa_submissions" DROP COLUMN "flight_eta",
DROP COLUMN "flight_etd",
DROP COLUMN "hotel_checkin",
DROP COLUMN "hotel_checkout",
DROP COLUMN "transport_type",
DROP COLUMN "trip_route",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rawdah_men_time" TEXT,
ADD COLUMN     "rawdah_women_time" TEXT;

-- DropTable
DROP TABLE "manifests";

-- CreateTable
CREATE TABLE "flight_manifests" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "type" "FlightType" NOT NULL DEFAULT 'DEPARTURE',
    "flight_no" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "flight_date" TIMESTAMP(3) NOT NULL,
    "eta" TIMESTAMP(3) NOT NULL,
    "etd" TIMESTAMP(3) NOT NULL,
    "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "flight_manifests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_manifests" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "resv_no" TEXT NOT NULL,
    "check_in" TIMESTAMP(3) NOT NULL,
    "check_out" TIMESTAMP(3) NOT NULL,
    "city" "HotelCity" NOT NULL DEFAULT 'MAKKAH',
    "room_type" "RoomType" NOT NULL DEFAULT 'QUAD',
    "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "hotel_manifests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportation_manifests" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "type" "TransportType" NOT NULL DEFAULT 'BUS',
    "company" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "from" TEXT,
    "to" TEXT,
    "total_vehicle" INTEGER NOT NULL DEFAULT 1,
    "total_h" INTEGER,
    "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "transportation_manifests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pilgrims_user_id_key" ON "pilgrims"("user_id");

-- AddForeignKey
ALTER TABLE "pilgrims" ADD CONSTRAINT "pilgrims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_manifests" ADD CONSTRAINT "flight_manifests_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "visa_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_manifests" ADD CONSTRAINT "hotel_manifests_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "visa_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_manifests" ADD CONSTRAINT "transportation_manifests_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "visa_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
