-- CreateTable
CREATE TABLE "app_settings" (
    "key" VARCHAR(60) NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key")
);
