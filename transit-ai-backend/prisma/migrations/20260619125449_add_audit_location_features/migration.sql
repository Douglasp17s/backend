-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "recordName" VARCHAR(255),
ADD COLUMN     "sindicatoId" BIGINT;

-- CreateTable
CREATE TABLE "location_tests" (
    "id" BIGSERIAL NOT NULL,
    "internalId" BIGINT NOT NULL,
    "syndicateId" BIGINT NOT NULL,
    "driverId" BIGINT,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "speedKmh" INTEGER NOT NULL DEFAULT 0,
    "heading" INTEGER,
    "accuracy" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "location_tests_internalId_idx" ON "location_tests"("internalId");

-- CreateIndex
CREATE INDEX "location_tests_syndicateId_idx" ON "location_tests"("syndicateId");

-- CreateIndex
CREATE INDEX "location_tests_driverId_idx" ON "location_tests"("driverId");

-- CreateIndex
CREATE INDEX "location_tests_timestamp_idx" ON "location_tests"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_sindicatoId_idx" ON "audit_logs"("sindicatoId");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_sindicatoId_fkey" FOREIGN KEY ("sindicatoId") REFERENCES "syndicates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_tests" ADD CONSTRAINT "location_tests_internalId_fkey" FOREIGN KEY ("internalId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_tests" ADD CONSTRAINT "location_tests_syndicateId_fkey" FOREIGN KEY ("syndicateId") REFERENCES "syndicates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_tests" ADD CONSTRAINT "location_tests_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
