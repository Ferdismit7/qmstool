-- Migration: Create Business Document Links Table
-- Description: Creates a junction table to link Business Documents with other Business Documents
-- Date: 2024-01-XX
-- Author: QMS Tool System

-- Create the business_document_links table
CREATE TABLE `business_document_links` (
  `id` int NOT NULL AUTO_INCREMENT,
  `primary_document_id` int NOT NULL,
  `related_document_id` int NOT NULL,
  `created_at` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_document_link_pair` (`primary_document_id`, `related_document_id`),
  KEY `idx_primary_document_id` (`primary_document_id`),
  KEY `idx_related_document_id` (`related_document_id`),
  KEY `idx_document_link_created_by` (`created_by`),
  KEY `idx_document_link_created_at` (`created_at`),
  CONSTRAINT `fk_bdl_primary_document` FOREIGN KEY (`primary_document_id`) REFERENCES `businessdocumentregister` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bdl_related_document` FOREIGN KEY (`related_document_id`) REFERENCES `businessdocumentregister` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bdl_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add comments to the table and columns for documentation
ALTER TABLE `business_document_links` 
COMMENT = 'Junction table linking Business Documents to other Business Documents';

ALTER TABLE `business_document_links` 
MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key for the link record',
MODIFY COLUMN `primary_document_id` int NOT NULL COMMENT 'Foreign key to businessdocumentregister.id (source document)',
MODIFY COLUMN `related_document_id` int NOT NULL COMMENT 'Foreign key to businessdocumentregister.id (related document)',
MODIFY COLUMN `created_at` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the link was created',
MODIFY COLUMN `updated_at` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when the link was last updated',
MODIFY COLUMN `created_by` int DEFAULT NULL COMMENT 'Foreign key to users.id - who created this link';

-- Create indexes for better query performance
CREATE INDEX `idx_bdl_created_at_desc` ON `business_document_links` (`created_at` DESC);
CREATE INDEX `idx_bdl_updated_at_desc` ON `business_document_links` (`updated_at` DESC);

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
    AND TABLE_NAME = 'business_document_links';

-- Show the table structure
DESCRIBE `business_document_links`;

-- Show all indexes on the table
SHOW INDEX FROM `business_document_links`;
