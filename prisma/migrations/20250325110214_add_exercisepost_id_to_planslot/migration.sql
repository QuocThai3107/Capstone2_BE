/*
  Warnings:

  - The primary key for the `certificate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `refresh_token` on the `user` table. All the data in the column will be lost.
  - Added the required column `id` to the `certificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `certificate` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `imgurl` TEXT NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `planslot` ADD COLUMN `_id` INTEGER NULL,
    ADD COLUMN `exercisepost_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `refresh_token`;

-- AddForeignKey
ALTER TABLE `planslot` ADD CONSTRAINT `planslot_exercisepost_id_fkey` FOREIGN KEY (`exercisepost_id`) REFERENCES `exercisepost`(`exercisepost_id`) ON DELETE SET NULL ON UPDATE CASCADE;
