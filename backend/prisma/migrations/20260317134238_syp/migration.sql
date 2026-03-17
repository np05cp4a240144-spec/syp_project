-- CreateTable
CREATE TABLE `Settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `garageName` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `taxId` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NULL,
    `monFriOpen` VARCHAR(191) NULL DEFAULT '08:00',
    `monFriClose` VARCHAR(191) NULL DEFAULT '17:30',
    `satOpen` VARCHAR(191) NULL DEFAULT '09:00',
    `satClose` VARCHAR(191) NULL DEFAULT '14:00',
    `sundayOpen` BOOLEAN NULL DEFAULT false,
    `publicHolidayClosures` BOOLEAN NULL DEFAULT true,
    `taxRate` DOUBLE NULL DEFAULT 8.0,
    `invoicePrefix` VARCHAR(191) NULL DEFAULT 'INV-',
    `paymentTerms` VARCHAR(191) NULL DEFAULT 'Due on completion',
    `autoSendInvoices` BOOLEAN NULL DEFAULT true,
    `acceptOnlinePayments` BOOLEAN NULL DEFAULT true,
    `loyaltyDiscounts` BOOLEAN NULL DEFAULT true,
    `loyaltyDiscountRate` DOUBLE NULL DEFAULT 10.0,
    `notificationPrefs` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
