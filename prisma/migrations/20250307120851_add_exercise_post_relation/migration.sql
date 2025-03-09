-- AlterTable
ALTER TABLE `planslot` ADD COLUMN `exercise_post_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PlanSlot` ADD CONSTRAINT `PlanSlot_exercise_post_id_fkey` FOREIGN KEY (`exercise_post_id`) REFERENCES `ExercisePost`(`exercisepost_id`) ON DELETE SET NULL ON UPDATE CASCADE;
