/*
  Warnings:

  - Added the required column `name` to the `shifts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('MANANA', 'TARDE', 'NOCTURNO');

-- AlterTable
ALTER TABLE "shifts" DROP COLUMN "name",
ADD COLUMN     "name" "Turno" NOT NULL;
