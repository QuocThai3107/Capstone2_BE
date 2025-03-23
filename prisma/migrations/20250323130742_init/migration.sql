-- CreateTable
CREATE TABLE `planslot` (
    `plan_id` INTEGER NOT NULL,
    `no` VARCHAR(2) NOT NULL,
    `note` VARCHAR(50) NULL,
    `duration` INTEGER NULL,

    PRIMARY KEY (`plan_id`, `no`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat` (
    `chat_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `to_user_id` INTEGER NOT NULL,
    `content` TEXT NULL,
    `img_url` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Chat_to_user_id_fkey`(`to_user_id`),
    INDEX `Chat_user_id_fkey`(`user_id`),
    PRIMARY KEY (`chat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercisepost` (
    `exercisepost_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `img_url` TEXT NULL,
    `status_id` INTEGER NULL,
    `user_id` INTEGER NOT NULL,
    `video_rul` TEXT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`exercisepost_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exerciseposttag` (
    `exercisepost_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    INDEX `ExercisepostTag_tag_id_fkey`(`tag_id`),
    PRIMARY KEY (`exercisepost_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membership` (
    `membership_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `membership_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `membership_type` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `duration` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`membership_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `amount_paid` DECIMAL(10, 2) NULL,
    `payment_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status_id` INTEGER NULL,
    `payment_method` VARCHAR(20) NULL,
    `order_id` VARCHAR(255) NULL,
    `membership_id` INTEGER NOT NULL,

    INDEX `Payment_user_id_fkey`(`user_id`),
    INDEX `fk_payment_membership`(`membership_id`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan` (
    `plan_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `plan_name` VARCHAR(50) NULL,
    `Description` TEXT NULL,
    `total_duration` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Plan_user_id_fkey`(`user_id`),
    PRIMARY KEY (`plan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommend` (
    `user_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    INDEX `Recommend_tag_id_fkey`(`tag_id`),
    PRIMARY KEY (`user_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule` (
    `schedule_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `note` VARCHAR(50) NULL,
    `plan_id` INTEGER NOT NULL,
    `day` VARCHAR(20) NULL,
    `start_hour` TIME(0) NULL,
    `end_hour` TIME(0) NULL,

    INDEX `Schedule_plan_id_fkey`(`plan_id`),
    INDEX `Schedule_user_id_fkey`(`user_id`),
    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `step` (
    `exercisepost_id` INTEGER NOT NULL,
    `step_number` VARCHAR(2) NOT NULL,
    `instruction` TEXT NULL,
    `img_url` TEXT NULL,

    PRIMARY KEY (`exercisepost_id`, `step_number`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag` (
    `tag_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tag_name` VARCHAR(50) NULL,

    PRIMARY KEY (`tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NULL,
    `password` VARCHAR(64) NULL,
    `email` VARCHAR(255) NULL,
    `phoneNum` VARCHAR(10) NULL,
    `role_id` INTEGER NULL,
    `Status_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(50) NULL,
    `imgUrl` TEXT NULL,
    `introduction` TEXT NULL,
    `Health_information` TEXT NULL,
    `illness` TEXT NULL,
    `gym` VARCHAR(50) NULL,
    `refresh_token` TEXT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificate` (
    `user_id` INTEGER NOT NULL,
    `imgurl` VARCHAR(255) NOT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`user_id`, `imgurl`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `planslot` ADD CONSTRAINT `PlanSlot_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plan`(`plan_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat` ADD CONSTRAINT `Chat_to_user_id_fkey` FOREIGN KEY (`to_user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat` ADD CONSTRAINT `Chat_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercisepost` ADD CONSTRAINT `exercisepost_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exerciseposttag` ADD CONSTRAINT `ExercisepostTag_exercisepost_id_fkey` FOREIGN KEY (`exercisepost_id`) REFERENCES `exercisepost`(`exercisepost_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exerciseposttag` ADD CONSTRAINT `ExercisepostTag_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tag`(`tag_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membership` ADD CONSTRAINT `membership_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `Payment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `fk_payment_membership` FOREIGN KEY (`membership_id`) REFERENCES `membership`(`membership_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `plan` ADD CONSTRAINT `Plan_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommend` ADD CONSTRAINT `Recommend_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tag`(`tag_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommend` ADD CONSTRAINT `Recommend_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule` ADD CONSTRAINT `Schedule_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plan`(`plan_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule` ADD CONSTRAINT `Schedule_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `step` ADD CONSTRAINT `Step_exercisepost_id_fkey` FOREIGN KEY (`exercisepost_id`) REFERENCES `exercisepost`(`exercisepost_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificate` ADD CONSTRAINT `certificate_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
