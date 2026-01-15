-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 29, 2025 at 12:59 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lucky_draw_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `auditlog`
--

CREATE TABLE `auditlog` (
  `id` bigint(20) NOT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` bigint(20) DEFAULT NULL,
  `adminId` bigint(20) DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `draw`
--

CREATE TABLE `draw` (
  `id` bigint(20) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `entryFee` int(11) NOT NULL,
  `startTime` datetime(3) NOT NULL,
  `endTime` datetime(3) NOT NULL,
  `maxTickets` int(11) NOT NULL,
  `status` enum('DRAFT','LIVE','CLOSED','RESULT_DECLARED') NOT NULL DEFAULT 'DRAFT',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `draw`
--

INSERT INTO `draw` (`id`, `title`, `description`, `entryFee`, `startTime`, `endTime`, `maxTickets`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'ascsa', 'ascsacasc assacvasvcascascasca', 501, '2025-12-25 22:26:00.000', '2025-12-25 22:26:00.000', 15555, 'DRAFT', '2025-12-26 09:26:34.552', '2025-12-26 09:30:10.393'),
(2, 'Diwali Bumper Draw', 'Big Diwali Prizes', 501, '2025-10-01 10:00:00.000', '2025-10-10 18:00:00.000', 100, 'CLOSED', '2025-12-27 12:54:13.000', '2025-12-27 12:54:13.000'),
(3, 'New Year Mega Draw', 'Welcome 2026', 1100, '2025-12-25 10:00:00.000', '2025-12-31 20:00:00.000', 200, 'LIVE', '2025-12-27 12:54:13.000', '2025-12-27 12:54:13.000');

-- --------------------------------------------------------

--
-- Table structure for table `drawproduct`
--

CREATE TABLE `drawproduct` (
  `id` bigint(20) NOT NULL,
  `drawId` bigint(20) NOT NULL,
  `name` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drawproduct`
--

INSERT INTO `drawproduct` (`id`, `drawId`, `name`, `image`, `quantity`, `description`, `createdAt`) VALUES
(1, 1, 'scasc', NULL, 22, 'sdvasvsd ssacasc', '2025-12-26 09:30:21.038'),
(2, 1, 'iPhone 15', NULL, 1, 'Apple iPhone 15', '2025-12-27 12:55:17.000'),
(3, 1, 'Gold Coin', NULL, 2, '24K Gold Coin', '2025-12-27 12:55:17.000'),
(4, 2, 'MacBook Air', NULL, 1, 'Apple MacBook Air', '2025-12-27 12:55:17.000');

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` bigint(20) NOT NULL,
  `userId` bigint(20) NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` varchar(191) NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id` bigint(20) NOT NULL,
  `userId` bigint(20) NOT NULL,
  `drawId` bigint(20) NOT NULL,
  `amount` int(11) NOT NULL,
  `transactionId` varchar(191) NOT NULL,
  `screenshot` varchar(191) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`id`, `userId`, `drawId`, `amount`, `transactionId`, `screenshot`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 501, 'TXN501ABC', 'https://dummy.com/ss1.png', 'APPROVED', '2025-12-27 12:55:31.000', '2025-12-27 12:55:31.000'),
(2, 2, 1, 1100, 'TXN1100XYZ', 'https://dummy.com/ss2.png', 'APPROVED', '2025-12-27 12:55:31.000', '2025-12-27 12:55:31.000'),
(3, 1, 2, 1100, 'TXNNEWYEAR', 'https://dummy.com/ss3.png', 'PENDING', '2025-12-27 12:55:31.000', '2025-12-27 12:55:31.000');

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

CREATE TABLE `ticket` (
  `id` bigint(20) NOT NULL,
  `ticketCode` varchar(191) NOT NULL,
  `userId` bigint(20) NOT NULL,
  `drawId` bigint(20) NOT NULL,
  `paymentId` bigint(20) DEFAULT NULL,
  `source` enum('USER_PURCHASE','ADMIN_MANUAL') NOT NULL,
  `isWinner` tinyint(1) NOT NULL DEFAULT 0,
  `createdByAdminId` bigint(20) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` bigint(20) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `mobile` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `name`, `role`, `createdAt`, `isActive`, `mobile`, `updatedAt`) VALUES
(1, 'admin@gmail.com', '$2b$10$ohcnTXtOctP57mMBQoVQZeXaiesJ4meGphjFKZG4M/xZ.TADiwAPa', 'admin', 'ADMIN', '2025-12-23 18:17:09.137', 1, '999999999', '2025-12-23 18:17:09.137'),
(2, 'rahul@test.com', 'hashed', 'Rahul Sharma', 'USER', '2025-12-27 12:53:26.000', 1, '9999999991', '2025-12-27 12:53:26.000'),
(3, 'aman@test.com', 'hashed', 'Aman Verma', 'USER', '2025-12-27 12:53:26.000', 1, '9999999992', '2025-12-27 12:53:26.000'),
(4, 'admin@test.com', 'hashed', 'Admin', 'ADMIN', '2025-12-27 12:53:26.000', 1, '9999999999', '2025-12-27 12:53:26.000');

-- --------------------------------------------------------

--
-- Table structure for table `winner`
--

CREATE TABLE `winner` (
  `id` bigint(20) NOT NULL,
  `ticketId` bigint(20) NOT NULL,
  `productId` bigint(20) NOT NULL,
  `declaredBy` bigint(20) NOT NULL,
  `declaredAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('2ec2866a-6dc4-448f-86ae-000213f5a887', '1722aa5f8f040a90421be03b22d5aaf50161022d6e49a8c7a0cfac63458cc222', '2025-12-23 13:52:05.321', '20251223135204_init', NULL, NULL, '2025-12-23 13:52:04.381', 1),
('779f2475-148f-4bb5-9f42-8652d1219a66', '0a52518c27224e758cba207d39d8aaa3d0c1837ce9a9b6e35d8ba092e84f1fda', '2025-12-23 13:52:00.502', '20251220125841_add_auth_and_social_features', NULL, NULL, '2025-12-23 13:52:00.080', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `draw`
--
ALTER TABLE `draw`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `drawproduct`
--
ALTER TABLE `drawproduct`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DrawProduct_drawId_fkey` (`drawId`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Notification_userId_fkey` (`userId`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Payment_userId_fkey` (`userId`),
  ADD KEY `Payment_drawId_fkey` (`drawId`);

--
-- Indexes for table `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Ticket_ticketCode_key` (`ticketCode`),
  ADD UNIQUE KEY `Ticket_paymentId_key` (`paymentId`),
  ADD KEY `Ticket_userId_fkey` (`userId`),
  ADD KEY `Ticket_drawId_fkey` (`drawId`),
  ADD KEY `Ticket_createdByAdminId_fkey` (`createdByAdminId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_mobile_key` (`mobile`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `winner`
--
ALTER TABLE `winner`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Winner_ticketId_key` (`ticketId`),
  ADD KEY `Winner_productId_fkey` (`productId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auditlog`
--
ALTER TABLE `auditlog`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `draw`
--
ALTER TABLE `draw`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `drawproduct`
--
ALTER TABLE `drawproduct`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `winner`
--
ALTER TABLE `winner`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `drawproduct`
--
ALTER TABLE `drawproduct`
  ADD CONSTRAINT `DrawProduct_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draw` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `Payment_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draw` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `Ticket_createdByAdminId_fkey` FOREIGN KEY (`createdByAdminId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Ticket_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draw` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Ticket_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Ticket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `winner`
--
ALTER TABLE `winner`
  ADD CONSTRAINT `Winner_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `drawproduct` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Winner_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
