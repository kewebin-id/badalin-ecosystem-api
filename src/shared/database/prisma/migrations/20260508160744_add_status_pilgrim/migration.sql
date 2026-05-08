-- CreateEnum
CREATE TYPE "AgencyStatus" AS ENUM ('ACTIVE', 'RESTRICTED', 'INACTIVE');

-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "status" "AgencyStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "pilgrims" ADD COLUMN     "is_eligible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "rejection_reason" TEXT;

-- AlterTable
ALTER TABLE "visa_submissions" ADD COLUMN     "refund_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "refund_deadline" TIMESTAMP(3),
ADD COLUMN     "refund_status" TEXT;
