/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Draw` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DrawProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Winner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DrawProduct` DROP FOREIGN KEY `DrawProduct_drawId_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_drawId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_createdByAdminId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_drawId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_paymentId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Winner` DROP FOREIGN KEY `Winner_productId_fkey`;

-- DropForeignKey
ALTER TABLE `Winner` DROP FOREIGN KEY `Winner_ticketId_fkey`;

-- DropTable
DROP TABLE `AuditLog`;

-- DropTable
DROP TABLE `Draw`;

-- DropTable
DROP TABLE `DrawProduct`;

-- DropTable
DROP TABLE `Notification`;

-- DropTable
DROP TABLE `Payment`;

-- DropTable
DROP TABLE `Ticket`;

-- DropTable
DROP TABLE `User`;

-- DropTable
DROP TABLE `Winner`;

-- CreateTable
CREATE TABLE `auditlog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` BIGINT NULL,
    `adminId` BIGINT NULL,
    `meta` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `draw` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `bannerImage` VARCHAR(191) NULL,
    `rules` LONGTEXT NULL,
    `entryFee` INTEGER NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `resultAt` DATETIME(3) NULL,
    `maxTickets` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'LIVE', 'CLOSED', 'RESULT_DECLARED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `draw_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `drawproduct` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `drawId` BIGINT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DrawProduct_drawId_fkey`(`drawId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `drawId` BIGINT NOT NULL,
    `amount` INTEGER NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `gatewayOrderId` VARCHAR(191) NULL,
    `gatewayPaymentId` VARCHAR(191) NULL,
    `method` ENUM('UPI', 'CARD', 'NET_BANKING', 'WALLET', 'CASH') NOT NULL,
    `gateway` ENUM('RAZORPAY', 'STRIPE', 'PAYTM', 'MANUAL') NOT NULL,
    `screenshot` VARCHAR(191) NULL,
    `failureReason` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_transactionId_key`(`transactionId`),
    INDEX `payment_userId_idx`(`userId`),
    INDEX `payment_drawId_idx`(`drawId`),
    INDEX `payment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `ticketCode` VARCHAR(191) NOT NULL,
    `userId` BIGINT NOT NULL,
    `drawId` BIGINT NOT NULL,
    `paymentId` BIGINT NULL,
    `pricePaid` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'ACTIVE',
    `source` ENUM('USER_PURCHASE', 'ADMIN_MANUAL') NOT NULL,
    `isWinner` BOOLEAN NOT NULL DEFAULT false,
    `coverImage` VARCHAR(191) NULL,
    `createdByAdminId` BIGINT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ticket_ticketCode_key`(`ticketCode`),
    UNIQUE INDEX `ticket_paymentId_key`(`paymentId`),
    INDEX `ticket_userId_idx`(`userId`),
    INDEX `ticket_drawId_idx`(`drawId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `wallet` INTEGER NOT NULL DEFAULT 0,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `mobile` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_mobile_key`(`mobile`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `winner` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `ticketId` BIGINT NOT NULL,
    `productId` BIGINT NOT NULL,
    `declaredBy` BIGINT NOT NULL,
    `declaredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Winner_ticketId_key`(`ticketId`),
    INDEX `Winner_productId_fkey`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `drawproduct` ADD CONSTRAINT `DrawProduct_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draw`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draw`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draw`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `winner` ADD CONSTRAINT `Winner_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `drawproduct`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `winner` ADD CONSTRAINT `Winner_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
