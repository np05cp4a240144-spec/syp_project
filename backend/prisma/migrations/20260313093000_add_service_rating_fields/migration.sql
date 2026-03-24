-- Add per-service rating support
ALTER TABLE `Rating`
    ADD COLUMN `appointmentId` INTEGER NULL,
    ADD COLUMN `serviceName` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Rating_appointmentId_key` ON `Rating`(`appointmentId`);
CREATE INDEX `Rating_serviceName_idx` ON `Rating`(`serviceName`);

ALTER TABLE `Rating`
    ADD CONSTRAINT `Rating_appointmentId_fkey`
    FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
