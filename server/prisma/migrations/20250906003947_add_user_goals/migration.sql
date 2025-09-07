/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "accounts";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "transactions";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "user_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "primaryGoal" TEXT NOT NULL,
    "secondaryGoals" TEXT,
    "targetSavingsRate" DECIMAL,
    "emergencyFundTarget" DECIMAL,
    "debtPayoffTimeframe" INTEGER,
    "riskTolerance" TEXT,
    "monthlyIncome" DECIMAL,
    "monthlyExpenses" DECIMAL,
    "retirementAge" INTEGER,
    "majorPurchaseTarget" TEXT,
    "majorPurchaseAmount" DECIMAL,
    "majorPurchaseTimeframe" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
