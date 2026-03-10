-- AlterTable
ALTER TABLE `Appointment` ADD COLUMN `mechanicId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_mechanicId_fkey` FOREIGN KEY (`mechanicId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
