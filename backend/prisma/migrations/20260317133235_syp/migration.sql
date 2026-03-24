-- AlterTable
ALTER TABLE `user` ADD COLUMN `notificationPrefs` JSON NULL,
    ADD COLUMN `shiftEnd` VARCHAR(191) NULL DEFAULT '17:00',
    ADD COLUMN `shiftStart` VARCHAR(191) NULL DEFAULT '08:00',
    ADD COLUMN `workDays` VARCHAR(191) NULL DEFAULT 'Monday – Friday';
