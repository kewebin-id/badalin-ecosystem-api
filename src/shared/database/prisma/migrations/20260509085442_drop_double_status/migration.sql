/*
  Warnings:

  - You are about to drop the column `verify_status` on the `visa_submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "visa_submissions" DROP COLUMN "verify_status",
ADD COLUMN     "review_status" "VerifyStatus" NOT NULL DEFAULT 'IN_REVIEW';
