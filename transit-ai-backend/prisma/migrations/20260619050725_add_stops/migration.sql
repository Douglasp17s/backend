-- CreateTable
CREATE TABLE "stops" (
    "id" BIGSERIAL NOT NULL,
    "lineId" BIGINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "centerLat" DECIMAL(10,7) NOT NULL,
    "centerLng" DECIMAL(10,7) NOT NULL,
    "radiusMeters" INTEGER NOT NULL DEFAULT 100,
    "boundaryPoints" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stops_lineId_idx" ON "stops"("lineId");

-- CreateIndex
CREATE INDEX "stops_active_idx" ON "stops"("active");

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "bus_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
