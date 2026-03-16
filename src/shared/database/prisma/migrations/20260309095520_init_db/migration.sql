-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'PROVIDER', 'PILGRIM');

-- CreateEnum
CREATE TYPE "VerifyStatus" AS ENUM ('IN_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CHECKING', 'COMPLETED');

-- CreateTable
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "visa_price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bank_name" TEXT,
    "bank_account_name" TEXT,
    "bank_account_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PILGRIM',
    "agency_id" TEXT,
    "invitation_token" TEXT,
    "invitation_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilgrims" (
    "id" TEXT NOT NULL,
    "leader_id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "passport_number" TEXT NOT NULL,
    "passport_expiry" TIMESTAMP(3) NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "marital_status" TEXT,
    "uniform_size" TEXT,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pilgrims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visa_submissions" (
    "id" TEXT NOT NULL,
    "leader_id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "status" "VerifyStatus" NOT NULL DEFAULT 'IN_REVIEW',
    "verify_status" "VerifyStatus" NOT NULL DEFAULT 'IN_REVIEW',
    "verifier_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "result_snapshot" JSONB,
    "anomaly_handled" BOOLEAN NOT NULL DEFAULT false,
    "reimburse_ticket" TEXT,
    "replenish_ticket" TEXT,
    "rejection_reason" TEXT,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "proof_of_payment" TEXT,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "visa_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manifests" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "flight_number" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "arrival_date" TIMESTAMP(3) NOT NULL,
    "hotel_makkah" TEXT NOT NULL,
    "hotel_madinah" TEXT NOT NULL,
    "rawdah_men_date" TIMESTAMP(3),
    "rawdah_women_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manifests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SubmissionMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubmissionMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "agencies_slug_key" ON "agencies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pilgrims_passport_number_key" ON "pilgrims"("passport_number");

-- CreateIndex
CREATE UNIQUE INDEX "visa_submissions_reimburse_ticket_key" ON "visa_submissions"("reimburse_ticket");

-- CreateIndex
CREATE UNIQUE INDEX "visa_submissions_replenish_ticket_key" ON "visa_submissions"("replenish_ticket");

-- CreateIndex
CREATE INDEX "_SubmissionMembers_B_index" ON "_SubmissionMembers"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pilgrims" ADD CONSTRAINT "pilgrims_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_submissions" ADD CONSTRAINT "visa_submissions_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_submissions" ADD CONSTRAINT "visa_submissions_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubmissionMembers" ADD CONSTRAINT "_SubmissionMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "pilgrims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubmissionMembers" ADD CONSTRAINT "_SubmissionMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "visa_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
