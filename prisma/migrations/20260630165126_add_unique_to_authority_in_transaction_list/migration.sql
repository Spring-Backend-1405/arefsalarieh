/*
  Warnings:

  - A unique constraint covering the columns `[authority]` on the table `TransactionList` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TransactionList_authority_key" ON "TransactionList"("authority");
