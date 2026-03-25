-- MySQL schema for Sport Booking

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE SCHEMA IF NOT EXISTS `db_sportbooking`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `db_sportbooking`;

-- -----------------------------------------------------
-- Table: sports
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sports`;

CREATE TABLE `sports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sports_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table: fields
-- -----------------------------------------------------
DROP TABLE IF EXISTS `fields`;

CREATE TABLE `fields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `sport_id` int NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fields_sport` (`sport_id`),
  CONSTRAINT `fk_fields_sport` FOREIGN KEY (`sport_id`) REFERENCES `sports` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table: customers
-- -----------------------------------------------------
DROP TABLE IF EXISTS `customers`;

CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(120) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customers_phone` (`phone`)  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table: slots
-- -----------------------------------------------------
DROP TABLE IF EXISTS `slots`;

CREATE TABLE `slots` (
  `id_slots` int NOT NULL AUTO_INCREMENT,
  `field_id` int NOT NULL,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime NOT NULL,
  `price_cents` int NOT NULL DEFAULT '0',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_slots`),
  UNIQUE KEY `uq_slots_field_time` (`field_id`,`starts_at`,`ends_at`),
  KEY `idx_slots_field_id` (`field_id`),
  KEY `idx_slots_starts_at` (`starts_at`),
  KEY `idx_slots_field_starts_at` (`field_id`,`starts_at`),
  CONSTRAINT `fk_slots_field` FOREIGN KEY (`field_id`) REFERENCES `fields` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table: bookings
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookings`;

CREATE TABLE `bookings` (
  `id_booking` int NOT NULL AUTO_INCREMENT,
  `slot_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `players_count` int NOT NULL DEFAULT '1',
  `notes` text,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_booking`),
  UNIQUE KEY `uq_bookings_slot` (`slot_id`),
  KEY `fk_bookings_customer` (`customer_id`),
  KEY `idx_bookings_status` (`status`),
  KEY `idx_bookings_created_at` (`created_at`),
  CONSTRAINT `fk_bookings_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_slot` FOREIGN KEY (`slot_id`) REFERENCES `slots` (`id_slots`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table: bookings_history
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookings_history`;

CREATE TABLE `bookings_history` (
  `id_booking_history` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `slot_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `players_count` int NOT NULL DEFAULT '1',
  `notes` text,
  `status` varchar(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `archived_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_booking_history`),
  KEY `idx_bh_slot` (`slot_id`),
  KEY `idx_bh_customer` (`customer_id`),
  KEY `idx_bh_status` (`status`),
  KEY `idx_bh_archived_at` (`archived_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table: admin_users
-- -----------------------------------------------------
DROP TABLE IF EXISTS `admin_users`;

CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table: opening_hours
-- -----------------------------------------------------
DROP TABLE IF EXISTS `opening_hours`;

CREATE TABLE `opening_hours` (
  `id` int NOT NULL AUTO_INCREMENT,
  `day_of_week` tinyint NOT NULL COMMENT '0=Lunedì, 6=Domenica',
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `is_closed` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_opening_hours_day` (`day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;