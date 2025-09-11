-- Migration: Create Business Process Document Links Table
-- Description: Creates a junction table to link Business Processes with Business Documents
-- Date: 2024-01-XX
-- Author: QMS Tool System

-- Create the business_process_document_links table
CREATE TABLE `business_process_document_links` (
  `id` int NOT NULL AUTO_INCREMENT,
  `business_process_id` int NOT NULL,
  `business_document_id` int NOT NULL,
  `created_at` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_bp_bd_link` (`business_process_id`, `business_document_id`),
  KEY `idx_business_process_id` (`business_process_id`),
  KEY `idx_business_document_id` (`business_document_id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_bpdl_business_process` FOREIGN KEY (`business_process_id`) REFERENCES `businessprocessregister` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bpdl_business_document` FOREIGN KEY (`business_document_id`) REFERENCES `businessdocumentregister` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bpdl_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add comments to the table and columns for documentation
ALTER TABLE `business_process_document_links` 
COMMENT = 'Junction table linking Business Processes to Business Documents';

ALTER TABLE `business_process_document_links` 
MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key for the link record',
MODIFY COLUMN `business_process_id` int NOT NULL COMMENT 'Foreign key to businessprocessregister.id',
MODIFY COLUMN `business_document_id` int NOT NULL COMMENT 'Foreign key to businessdocumentregister.id',
MODIFY COLUMN `created_at` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the link was created',
MODIFY COLUMN `updated_at` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when the link was last updated',
MODIFY COLUMN `created_by` int DEFAULT NULL COMMENT 'Foreign key to users.id - who created this link';

-- Create indexes for better query performance
CREATE INDEX `idx_bpdl_created_at_desc` ON `business_process_document_links` (`created_at` DESC);
CREATE INDEX `idx_bpdl_updated_at_desc` ON `business_process_document_links` (`updated_at` DESC);

-- Insert sample data (optional - remove if not needed)
-- INSERT INTO `business_process_document_links` (`business_process_id`, `business_document_id`, `created_by`) 
-- VALUES 
-- (1, 1, 1),
-- (1, 2, 1),
-- (2, 3, 1);

-- Verify the table was created successfully
SELECT 
    TABLE_NAME,
    TABLE_COMMENT,
    ENGINE,
    TABLE_COLLATION
FROM 
    INFORMATION_SCHEMA.TABLES 
WHERE 
    TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'business_process_document_links';

-- Show the table structure
DESCRIBE `business_process_document_links`;

-- Show all indexes on the table
SHOW INDEX FROM `business_process_document_links`;
