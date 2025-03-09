/*
  Warnings:

  - The primary key for the `planslot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `planslot` table. All the data in the column will be lost.
  - You are about to drop the column `exercise_post_id` on the `planslot` table. All the data in the column will be lost.
  - Added the required column `plan_slot_id` to the `PlanSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `planslot` DROP FOREIGN KEY `PlanSlot_exercise_post_id_fkey`;

-- AlterTable
ALTER TABLE `planslot` DROP PRIMARY KEY,
    DROP COLUMN `_id`,
    DROP COLUMN `exercise_post_id`,
    ADD COLUMN `plan_slot_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `temp_exercise_id` INTEGER NULL,
    ADD PRIMARY KEY (`plan_slot_id`);
