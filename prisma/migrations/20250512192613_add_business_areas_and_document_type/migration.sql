/*
  Warnings:

  - Added the required column `businessArea` to the `BusinessDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameAndNumbering` to the `BusinessDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subBusinessArea` to the `BusinessDocument` table without a default value. This is not possible if the table is not empty.

*/
-- First add the columns as nullable
ALTER TABLE `BusinessDocument` ADD COLUMN `businessArea` VARCHAR(191) NULL;
ALTER TABLE `BusinessDocument` ADD COLUMN `subBusinessArea` VARCHAR(191) NULL;
ALTER TABLE `BusinessDocument` ADD COLUMN `nameAndNumbering` VARCHAR(191) NULL;

-- Update existing records with default values
UPDATE `BusinessDocument` SET 
  `businessArea` = 'Default Business Area',
  `subBusinessArea` = 'Default Sub Business Area',
  `nameAndNumbering` = CONCAT('DOC-', id);

-- Make the columns required
ALTER TABLE `BusinessDocument` MODIFY `businessArea` VARCHAR(191) NOT NULL;
ALTER TABLE `BusinessDocument` MODIFY `subBusinessArea` VARCHAR(191) NOT NULL;
ALTER TABLE `BusinessDocument` MODIFY `nameAndNumbering` VARCHAR(191) NOT NULL;
