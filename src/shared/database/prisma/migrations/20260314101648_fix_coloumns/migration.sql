-- AlterEnum
ALTER TYPE "VerifyStatus" ADD VALUE 'AUTO_CANCELED';

-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "updated_by" TEXT;

-- AlterTable
ALTER TABLE "manifests" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "updated_by" TEXT;

-- AlterTable
ALTER TABLE "pilgrims" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "nik" TEXT,
ADD COLUMN     "relation" TEXT,
ADD COLUMN     "updated_by" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "updated_by" TEXT;

-- AlterTable
ALTER TABLE "visa_submissions" ADD COLUMN     "flight_eta" TIMESTAMP(3),
ADD COLUMN     "flight_etd" TIMESTAMP(3),
ADD COLUMN     "hotel_checkin" TIMESTAMP(3),
ADD COLUMN     "hotel_checkout" TIMESTAMP(3),
ADD COLUMN     "transport_type" TEXT,
ADD COLUMN     "trip_route" TEXT;
