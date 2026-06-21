-- CreateEnum
CREATE TYPE "WalletKind" AS ENUM ('USER', 'SYNDICATE');

-- CreateEnum
CREATE TYPE "WalletCategory" AS ENUM ('GENERAL', 'ESTUDIANTE', 'ADULTO_MAYOR');

-- CreateEnum
CREATE TYPE "WalletTxType" AS ENUM ('TOPUP', 'FARE_PAYMENT', 'PASS_PURCHASE');

-- CreateTable
CREATE TABLE "wallets" (
    "id" BIGSERIAL NOT NULL,
    "kind" "WalletKind" NOT NULL DEFAULT 'USER',
    "userId" BIGINT,
    "syndicateId" BIGINT,
    "address" VARCHAR(42) NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "category" "WalletCategory" NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" BIGSERIAL NOT NULL,
    "walletId" BIGINT NOT NULL,
    "type" "WalletTxType" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "baseFareCents" INTEGER,
    "discountBps" INTEGER,
    "counterparty" VARCHAR(42),
    "lineId" BIGINT,
    "txHash" VARCHAR(66) NOT NULL,
    "blockNumber" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transit_passes" (
    "id" BIGSERIAL NOT NULL,
    "walletId" BIGINT NOT NULL,
    "lineId" BIGINT,
    "priceCents" INTEGER NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transit_passes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_syndicateId_key" ON "wallets"("syndicateId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");

-- CreateIndex
CREATE INDEX "wallets_address_idx" ON "wallets"("address");

-- CreateIndex
CREATE INDEX "wallet_transactions_walletId_idx" ON "wallet_transactions"("walletId");

-- CreateIndex
CREATE INDEX "wallet_transactions_type_idx" ON "wallet_transactions"("type");

-- CreateIndex
CREATE INDEX "wallet_transactions_txHash_idx" ON "wallet_transactions"("txHash");

-- CreateIndex
CREATE INDEX "transit_passes_walletId_idx" ON "transit_passes"("walletId");

-- CreateIndex
CREATE INDEX "transit_passes_validUntil_idx" ON "transit_passes"("validUntil");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_syndicateId_fkey" FOREIGN KEY ("syndicateId") REFERENCES "syndicates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transit_passes" ADD CONSTRAINT "transit_passes_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
