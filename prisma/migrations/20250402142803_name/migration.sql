/*
  Warnings:

  - Made the column `day` on table `schedule` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `schedule` MODIFY `plan_id` INTEGER NULL,
    MODIFY `day` DATETIME(3) NOT NULL;
