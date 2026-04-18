-- CreateTable
CREATE TABLE "ocr_providers" (
    "id" TEXT NOT NULL,
    "key_filename" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "ocr_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocr_usages" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ocr_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ocr_providers_key_filename_key" ON "ocr_providers"("key_filename");

-- CreateIndex
CREATE UNIQUE INDEX "ocr_usages_provider_id_month_year_key" ON "ocr_usages"("provider_id", "month", "year");

-- AddForeignKey
ALTER TABLE "ocr_usages" ADD CONSTRAINT "ocr_usages_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ocr_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
