-- Rename column from temp_exercise_id to exercisepost_id
ALTER TABLE `plan_slots` 
CHANGE COLUMN `temp_exercise_id` `exercisepost_id` INTEGER NULL;

-- Add foreign key constraint
ALTER TABLE `plan_slots`
ADD CONSTRAINT `plan_slots_exercisepost_id_fkey` 
FOREIGN KEY (`exercisepost_id`) REFERENCES `exercisepost`(`exercisepost_id`) ON DELETE SET NULL ON UPDATE CASCADE; 