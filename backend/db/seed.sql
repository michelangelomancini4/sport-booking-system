USE db_sportbooking;

-- -----------------------------------------------------
-- Sports
-- -----------------------------------------------------

INSERT IGNORE INTO sports (id, name, is_active)
VALUES
(1, 'Padel', 1),
(2, 'Calcetto', 1);

-- -----------------------------------------------------
-- Fields
-- -----------------------------------------------------

INSERT IGNORE INTO fields (id, name, sport_id, is_active, notes)
VALUES
(1, 'Campo Padel 1', 1, 1, NULL),
(2, 'Campo Padel 2', 1, 1, NULL),
(3, 'Campo Calcetto 1', 2, 1, NULL);

-- -----------------------------------------------------
-- Demo customer
-- -----------------------------------------------------

INSERT IGNORE INTO customers (id, full_name, phone, email, notes)
VALUES
(1, 'Mario Rossi', '3331234567', 'mario@example.com', 'Cliente demo');