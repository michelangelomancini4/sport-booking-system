-- MySQL schema for Sport Booking (repo-friendly)

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema db_sportbooking
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `db_sportbooking`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `db_sportbooking`;

-- -----------------------------------------------------
-- Table: sports
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sports`;

CREATE TABLE `sports` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sports_name` (`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table: fields
-- -----------------------------------------------------
DROP TABLE IF EXISTS `fields`;

CREATE TABLE `fields` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `sport_id` INT NOT NULL,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fields_sport` (`sport_id`),
  CONSTRAINT `fk_fields_sport`
    FOREIGN KEY (`sport_id`)
    REFERENCES `sports` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table: customers
-- -----------------------------------------------------
DROP TABLE IF EXISTS `customers`;

CREATE TABLE `customers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(30) NULL DEFAULT NULL,
  `email` VARCHAR(120) NULL DEFAULT NULL,
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table: slots
-- -----------------------------------------------------
DROP TABLE IF EXISTS `slots`;

CREATE TABLE `slots` (
  `id_slots` INT NOT NULL AUTO_INCREMENT,
  `field_id` INT NOT NULL,
  `starts_at` DATETIME NOT NULL,
  `ends_at` DATETIME NOT NULL,
  `price_cents` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_slots`),

  -- Prevent duplicate time windows per field
  UNIQUE KEY `uq_slots_field_time` (`field_id`, `starts_at`, `ends_at`),

  -- Useful indexes for filtering / sorting
  KEY `idx_slots_field_id` (`field_id`),
  KEY `idx_slots_starts_at` (`starts_at`),
  KEY `idx_slots_field_starts_at` (`field_id`, `starts_at`),

  CONSTRAINT `fk_slots_field`
    FOREIGN KEY (`field_id`)
    REFERENCES `fields` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table: bookings
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookings`;

CREATE TABLE `bookings` (
  `id_booking` INT NOT NULL AUTO_INCREMENT,
  `slot_id` INT NOT NULL,
  `customer_id` INT NOT NULL,
  `players_count` INT NOT NULL DEFAULT 1,
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_booking`),

  -- One booking per slot
  UNIQUE KEY `uq_bookings_slot` (`slot_id`),

  KEY `idx_bookings_customer_id` (`customer_id`),
  KEY `idx_bookings_created_at` (`created_at`),

  CONSTRAINT `fk_bookings_customer`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT `fk_bookings_slot`
    FOREIGN KEY (`slot_id`)
    REFERENCES `slots` (`id_slots`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- Restore modes/checks
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
