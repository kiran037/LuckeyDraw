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
    `bannerImage` TEXT NULL,
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
    INDEX `draw_startTime_idx`(`startTime`),
    INDEX `draw_endTime_idx`(`endTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `drawproduct` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `drawId` BIGINT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `image` LONGTEXT NULL,
    `quantity` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `drawproduct_drawId_idx`(`drawId`),
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

    INDEX `notification_userId_idx`(`userId`),
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
    `avatar` LONGTEXT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `mobile` VARCHAR(191) NOT NULL,
    `wallet` INTEGER NOT NULL DEFAULT 0,
    `referralCode` VARCHAR(191) NOT NULL,
    `referredById` BIGINT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_mobile_key`(`mobile`),
    UNIQUE INDEX `user_referralCode_key`(`referralCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet_transaction` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `amount` INTEGER NOT NULL,
    `balanceAfter` INTEGER NOT NULL,
    `type` ENUM('CREDIT', 'DEBIT') NOT NULL,
    `source` ENUM('REFERRAL_BONUS', 'DRAW_ENTRY', 'REFUND', 'ADMIN_ADJUSTMENT', 'WIN_REWARD') NOT NULL,
    `referenceId` BIGINT NULL,
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wallet_transaction_userId_idx`(`userId`),
    INDEX `wallet_transaction_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `winner` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `ticketId` BIGINT NOT NULL,
    `productId` BIGINT NOT NULL,
    `drawId` BIGINT NOT NULL,
    `userId` BIGINT NOT NULL,
    `declaredBy` BIGINT NOT NULL,
    `declaredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `winner_ticketId_key`(`ticketId`),
    INDEX `winner_productId_idx`(`productId`),
    INDEX `winner_drawId_idx`(`drawId`),
    INDEX `winner_userId_idx`(`userId`),
    INDEX `winner_declaredBy_idx`(`declaredBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `referrerBonus` INTEGER NOT NULL,
    `refereeBonus` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `drawproduct` ADD CONSTRAINT `drawproduct_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draw`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `user` ADD CONSTRAINT `user_referredById_fkey` FOREIGN KEY (`referredById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transaction` ADD CONSTRAINT `wallet_transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `winner` ADD CONSTRAINT `winner_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `drawproduct`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `winner` ADD CONSTRAINT `winner_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `winner` ADD CONSTRAINT `winner_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draw`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `winner` ADD CONSTRAINT `winner_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `winner` ADD CONSTRAINT `winner_declaredBy_fkey` FOREIGN KEY (`declaredBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
