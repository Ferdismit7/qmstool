-- CreateTable
CREATE TABLE `BusinessProcess` (
    `id` VARCHAR(191) NOT NULL,
    `businessArea` VARCHAR(191) NOT NULL,
    `subBusinessArea` VARCHAR(191) NOT NULL,
    `processName` VARCHAR(191) NOT NULL,
    `documentName` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `progress` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `statusPercentage` INTEGER NOT NULL,
    `priority` VARCHAR(191) NOT NULL,
    `targetDate` DATETIME(3) NOT NULL,
    `processOwner` VARCHAR(191) NOT NULL,
    `updateDate` DATETIME(3) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `reviewDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessDocument` (
    `id` VARCHAR(191) NOT NULL,
    `documentName` VARCHAR(191) NOT NULL,
    `documentType` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `statusPercentage` INTEGER NOT NULL,
    `priority` VARCHAR(191) NOT NULL,
    `targetDate` DATETIME(3) NOT NULL,
    `documentOwner` VARCHAR(191) NOT NULL,
    `updateDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `remarks` VARCHAR(191) NULL,
    `reviewDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
