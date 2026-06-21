-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'SINDICATO_ADMIN', 'OPERATOR', 'DRIVER', 'PASSENGER');

-- CreateEnum
CREATE TYPE "GeneralStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('VALID', 'EXPIRED', 'SUSPENDED', 'RENEWING');

-- CreateEnum
CREATE TYPE "BusOperationalStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "RouteDirection" AS ENUM ('OUTBOUND', 'INBOUND', 'CIRCULAR');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "TripEndReason" AS ENUM ('COMPLETED_ROUTE', 'MECHANICAL_FAILURE', 'SHIFT_END', 'EMERGENCY', 'WEATHER', 'OTHER');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TerminalType" AS ENUM ('START', 'END', 'INTERMEDIATE', 'TRANSFER_HUB');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('MECHANICAL_FAILURE', 'ACCIDENT', 'PASSENGER_ISSUE', 'ROAD_BLOCK', 'WEATHER', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RouteRecordingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RouteRecordingMethod" AS ENUM ('ADMIN_DRAW', 'DRIVER_GPS', 'KML_IMPORT');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('SUGGESTED', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SERVICE_ALERT', 'ROUTE_DEVIATION', 'MAINTENANCE', 'INCIDENT', 'PAYMENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "TrafficSeverity" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "AIPredictionType" AS ENUM ('ETA_ARRIVAL', 'ROUTE_CONGESTION', 'BEST_TRIP_OPTION', 'DEMAND_FORECAST');

-- CreateTable
CREATE TABLE "syndicates" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "Nit" VARCHAR(20),
    "legalRepresentative" VARCHAR(150) NOT NULL,
    "contactPhone" VARCHAR(20) NOT NULL,
    "contactEmail" VARCHAR(100),
    "address" TEXT NOT NULL,
    "logoUrl" TEXT,
    "status" "GeneralStatus" NOT NULL DEFAULT 'ACTIVE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "syndicates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "syndicateId" BIGINT,
    "email" VARCHAR(150) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PASSENGER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" BIGINT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "syndicateId" BIGINT NOT NULL,
    "lineId" BIGINT,
    "nationalId" VARCHAR(20) NOT NULL,
    "nationalIdExtension" VARCHAR(5),
    "licenseNumber" VARCHAR(30) NOT NULL,
    "licenseCategory" VARCHAR(5) NOT NULL,
    "licenseExpirationDate" DATE NOT NULL,
    "credentialStatus" "CredentialStatus" NOT NULL DEFAULT 'VALID',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bus_lines" (
    "id" BIGSERIAL NOT NULL,
    "syndicateId" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "fare" DECIMAL(8,2) NOT NULL,
    "color" CHAR(7) NOT NULL,
    "operationStartTime" TIME,
    "operationEndTime" TIME,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "bus_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" BIGSERIAL NOT NULL,
    "lineId" BIGINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "direction" "RouteDirection" NOT NULL,
    "importedFileUrl" TEXT,
    "importedAt" TIMESTAMP(3),
    "totalDistanceKm" DECIMAL(8,2),
    "estimatedTimeMin" INTEGER,
    "restTimeMin" INTEGER DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "lastEditorId" BIGINT,
    "routeRecordingId" BIGINT,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_recordings" (
    "id" BIGSERIAL NOT NULL,
    "routeId" BIGINT,
    "lineId" BIGINT NOT NULL,
    "driverId" BIGINT,
    "approvedById" BIGINT,
    "method" "RouteRecordingMethod" NOT NULL,
    "direction" "RouteDirection" NOT NULL,
    "recordedPoints" JSONB NOT NULL,
    "simplifiedPoints" JSONB,
    "pointCount" INTEGER NOT NULL,
    "durationMinutes" INTEGER,
    "distanceKm" DECIMAL(8,2),
    "status" "RouteRecordingStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "approvedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buses" (
    "id" BIGSERIAL NOT NULL,
    "syndicateId" BIGINT NOT NULL,
    "lineId" BIGINT,
    "internalNumber" VARCHAR(10) NOT NULL,
    "licensePlate" VARCHAR(15) NOT NULL,
    "model" VARCHAR(80) NOT NULL,
    "manufactureYear" SMALLINT,
    "capacity" SMALLINT NOT NULL,
    "gpsDeviceId" VARCHAR(50),
    "operationalStatus" "BusOperationalStatus" NOT NULL DEFAULT 'ACTIVE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50),
    "daysOfWeek" VARCHAR(20) NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "expectedRounds" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_assignments" (
    "id" BIGSERIAL NOT NULL,
    "syndicateId" BIGINT NOT NULL,
    "driverId" BIGINT NOT NULL,
    "busId" BIGINT NOT NULL,
    "routeId" BIGINT NOT NULL,
    "shiftId" BIGINT,
    "date" DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "actualRounds" INTEGER,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" BIGSERIAL NOT NULL,
    "assignmentId" BIGINT NOT NULL,
    "driverId" BIGINT NOT NULL,
    "busId" BIGINT NOT NULL,
    "routeId" BIGINT NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "endReason" "TripEndReason",
    "averageSpeed" DECIMAL(5,2),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_locations" (
    "id" BIGSERIAL NOT NULL,
    "tripId" BIGINT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "heading" DECIMAL(5,2),
    "speed" DECIMAL(5,2),
    "accuracyMeters" DECIMAL(5,2),
    "batteryLevel" SMALLINT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terminals" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "type" "TerminalType" NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "busLineId" BIGINT,

    CONSTRAINT "terminals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "line_terminals" (
    "id" BIGSERIAL NOT NULL,
    "lineId" BIGINT NOT NULL,
    "terminalId" BIGINT NOT NULL,
    "type" "TerminalType" NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "line_terminals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" BIGSERIAL NOT NULL,
    "tripId" BIGINT NOT NULL,
    "driverId" BIGINT NOT NULL,
    "reviewedById" BIGINT,
    "type" "IncidentType" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "requestStopTracking" BOOLEAN NOT NULL DEFAULT false,
    "trackingStopped" BOOLEAN NOT NULL DEFAULT false,
    "reviewNotes" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_deviations" (
    "id" BIGSERIAL NOT NULL,
    "tripId" BIGINT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "distanceMeters" DECIMAL(8,2) NOT NULL,
    "justified" BOOLEAN NOT NULL DEFAULT false,
    "justification" TEXT,
    "reviewedById" BIGINT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "route_deviations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_transfers" (
    "id" BIGSERIAL NOT NULL,
    "originTripId" BIGINT NOT NULL,
    "destinationTripId" BIGINT NOT NULL,
    "decidedById" BIGINT,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'SUGGESTED',
    "reason" TEXT,
    "suggestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "internal_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "data" JSONB,
    "targetRole" "UserRole",
    "targetUserId" BIGINT,
    "createdById" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_receipts" (
    "id" BIGSERIAL NOT NULL,
    "notificationId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "pushToken" VARCHAR(255),
    "pushSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notification_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "preferredCriteria" VARCHAR(50),
    "maxWalkingMeters" INTEGER NOT NULL DEFAULT 500,
    "maxTransfers" INTEGER NOT NULL DEFAULT 2,
    "learnedPatterns" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_trips" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "alias" VARCHAR(100) NOT NULL,
    "originLatitude" DECIMAL(10,8) NOT NULL,
    "originLongitude" DECIMAL(11,8) NOT NULL,
    "originLabel" VARCHAR(150) NOT NULL,
    "destinationLatitude" DECIMAL(10,8) NOT NULL,
    "destinationLongitude" DECIMAL(11,8) NOT NULL,
    "destinationLabel" VARCHAR(150) NOT NULL,
    "lastResult" JSONB,
    "lastCalculatedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorite_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_predictions" (
    "id" BIGSERIAL NOT NULL,
    "type" "AIPredictionType" NOT NULL,
    "inputHash" VARCHAR(64) NOT NULL,
    "inputs" JSONB NOT NULL,
    "prediction" JSONB NOT NULL,
    "modelVersion" VARCHAR(20) NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "busLineId" BIGINT,

    CONSTRAINT "ai_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_conditions" (
    "id" BIGSERIAL NOT NULL,
    "affectedRouteId" BIGINT,
    "centerLatitude" DECIMAL(10,8) NOT NULL,
    "centerLongitude" DECIMAL(11,8) NOT NULL,
    "radiusMeters" INTEGER NOT NULL,
    "severity" "TrafficSeverity" NOT NULL,
    "source" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "traffic_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_metrics" (
    "id" BIGSERIAL NOT NULL,
    "metricType" VARCHAR(50) NOT NULL,
    "scope" VARCHAR(50) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lineId" BIGINT,

    CONSTRAINT "usage_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT,
    "action" "AuditAction" NOT NULL,
    "tableName" VARCHAR(100) NOT NULL,
    "recordId" BIGINT NOT NULL,
    "previousData" JSONB,
    "newData" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "syndicates_Nit_key" ON "syndicates"("Nit");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_syndicateId_idx" ON "users"("syndicateId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_nationalId_key" ON "drivers"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_licenseNumber_key" ON "drivers"("licenseNumber");

-- CreateIndex
CREATE INDEX "drivers_syndicateId_idx" ON "drivers"("syndicateId");

-- CreateIndex
CREATE INDEX "drivers_lineId_idx" ON "drivers"("lineId");

-- CreateIndex
CREATE INDEX "drivers_credentialStatus_idx" ON "drivers"("credentialStatus");

-- CreateIndex
CREATE UNIQUE INDEX "bus_lines_code_key" ON "bus_lines"("code");

-- CreateIndex
CREATE INDEX "bus_lines_syndicateId_idx" ON "bus_lines"("syndicateId");

-- CreateIndex
CREATE INDEX "routes_lineId_idx" ON "routes"("lineId");

-- CreateIndex
CREATE INDEX "routes_active_idx" ON "routes"("active");

-- CreateIndex
CREATE INDEX "route_recordings_routeId_idx" ON "route_recordings"("routeId");

-- CreateIndex
CREATE INDEX "route_recordings_lineId_idx" ON "route_recordings"("lineId");

-- CreateIndex
CREATE INDEX "route_recordings_status_idx" ON "route_recordings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "buses_licensePlate_key" ON "buses"("licensePlate");

-- CreateIndex
CREATE INDEX "buses_syndicateId_idx" ON "buses"("syndicateId");

-- CreateIndex
CREATE INDEX "buses_lineId_idx" ON "buses"("lineId");

-- CreateIndex
CREATE INDEX "buses_operationalStatus_idx" ON "buses"("operationalStatus");

-- CreateIndex
CREATE INDEX "daily_assignments_date_idx" ON "daily_assignments"("date");

-- CreateIndex
CREATE INDEX "daily_assignments_syndicateId_date_idx" ON "daily_assignments"("syndicateId", "date");

-- CreateIndex
CREATE INDEX "daily_assignments_driverId_date_idx" ON "daily_assignments"("driverId", "date");

-- CreateIndex
CREATE INDEX "trips_assignmentId_idx" ON "trips"("assignmentId");

-- CreateIndex
CREATE INDEX "trips_status_idx" ON "trips"("status");

-- CreateIndex
CREATE INDEX "trips_startedAt_idx" ON "trips"("startedAt");

-- CreateIndex
CREATE INDEX "driver_locations_tripId_idx" ON "driver_locations"("tripId");

-- CreateIndex
CREATE INDEX "driver_locations_recordedAt_idx" ON "driver_locations"("recordedAt");

-- CreateIndex
CREATE INDEX "line_terminals_lineId_idx" ON "line_terminals"("lineId");

-- CreateIndex
CREATE UNIQUE INDEX "line_terminals_lineId_terminalId_type_key" ON "line_terminals"("lineId", "terminalId", "type");

-- CreateIndex
CREATE INDEX "incidents_tripId_idx" ON "incidents"("tripId");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "incidents_type_idx" ON "incidents"("type");

-- CreateIndex
CREATE INDEX "route_deviations_tripId_idx" ON "route_deviations"("tripId");

-- CreateIndex
CREATE INDEX "route_deviations_detectedAt_idx" ON "route_deviations"("detectedAt");

-- CreateIndex
CREATE INDEX "internal_transfers_status_idx" ON "internal_transfers"("status");

-- CreateIndex
CREATE INDEX "notifications_targetUserId_idx" ON "notifications"("targetUserId");

-- CreateIndex
CREATE INDEX "notifications_targetRole_idx" ON "notifications"("targetRole");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notification_receipts_userId_idx" ON "notification_receipts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_receipts_notificationId_userId_key" ON "notification_receipts"("notificationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "favorite_trips_userId_idx" ON "favorite_trips"("userId");

-- CreateIndex
CREATE INDEX "ai_predictions_type_idx" ON "ai_predictions"("type");

-- CreateIndex
CREATE INDEX "ai_predictions_expiresAt_idx" ON "ai_predictions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_predictions_inputHash_modelVersion_key" ON "ai_predictions"("inputHash", "modelVersion");

-- CreateIndex
CREATE INDEX "traffic_conditions_affectedRouteId_idx" ON "traffic_conditions"("affectedRouteId");

-- CreateIndex
CREATE INDEX "traffic_conditions_detectedAt_idx" ON "traffic_conditions"("detectedAt");

-- CreateIndex
CREATE INDEX "usage_metrics_metricType_idx" ON "usage_metrics"("metricType");

-- CreateIndex
CREATE INDEX "usage_metrics_scope_idx" ON "usage_metrics"("scope");

-- CreateIndex
CREATE INDEX "usage_metrics_periodStart_idx" ON "usage_metrics"("periodStart");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_idx" ON "audit_logs"("tableName");

-- CreateIndex
CREATE INDEX "audit_logs_recordId_idx" ON "audit_logs"("recordId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_syndicateId_fkey" FOREIGN KEY ("syndicateId") REFERENCES "syndicates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_syndicateId_fkey" FOREIGN KEY ("syndicateId") REFERENCES "syndicates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "bus_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus_lines" ADD CONSTRAINT "bus_lines_syndicateId_fkey" FOREIGN KEY ("syndicateId") REFERENCES "syndicates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "bus_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_lastEditorId_fkey" FOREIGN KEY ("lastEditorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_routeRecordingId_fkey" FOREIGN KEY ("routeRecordingId") REFERENCES "route_recordings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_recordings" ADD CONSTRAINT "route_recordings_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "bus_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_recordings" ADD CONSTRAINT "route_recordings_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_recordings" ADD CONSTRAINT "route_recordings_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buses" ADD CONSTRAINT "buses_syndicateId_fkey" FOREIGN KEY ("syndicateId") REFERENCES "syndicates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buses" ADD CONSTRAINT "buses_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "bus_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_assignments" ADD CONSTRAINT "daily_assignments_syndicateId_fkey" FOREIGN KEY ("syndicateId") REFERENCES "syndicates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_assignments" ADD CONSTRAINT "daily_assignments_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_assignments" ADD CONSTRAINT "daily_assignments_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_assignments" ADD CONSTRAINT "daily_assignments_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_assignments" ADD CONSTRAINT "daily_assignments_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "daily_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_locations" ADD CONSTRAINT "driver_locations_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminals" ADD CONSTRAINT "terminals_busLineId_fkey" FOREIGN KEY ("busLineId") REFERENCES "bus_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_terminals" ADD CONSTRAINT "line_terminals_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "bus_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_terminals" ADD CONSTRAINT "line_terminals_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "terminals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_deviations" ADD CONSTRAINT "route_deviations_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_deviations" ADD CONSTRAINT "route_deviations_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_transfers" ADD CONSTRAINT "internal_transfers_originTripId_fkey" FOREIGN KEY ("originTripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_transfers" ADD CONSTRAINT "internal_transfers_destinationTripId_fkey" FOREIGN KEY ("destinationTripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_transfers" ADD CONSTRAINT "internal_transfers_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_receipts" ADD CONSTRAINT "notification_receipts_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_receipts" ADD CONSTRAINT "notification_receipts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_trips" ADD CONSTRAINT "favorite_trips_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_predictions" ADD CONSTRAINT "ai_predictions_busLineId_fkey" FOREIGN KEY ("busLineId") REFERENCES "bus_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traffic_conditions" ADD CONSTRAINT "traffic_conditions_affectedRouteId_fkey" FOREIGN KEY ("affectedRouteId") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_metrics" ADD CONSTRAINT "usage_metrics_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "bus_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
