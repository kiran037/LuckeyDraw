-- AlterTable
ALTER TABLE `draw` MODIFY `bannerImage` TEXT NULL;

-- CreateIndex
CREATE INDEX `draw_startTime_idx` ON `draw`(`startTime`);

-- CreateIndex
CREATE INDEX `draw_endTime_idx` ON `draw`(`endTime`);
