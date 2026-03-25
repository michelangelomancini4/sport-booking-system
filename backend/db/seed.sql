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

-- -----------------------------------------------------
-- Opening Hours (0=Lun, 1=Mar, 2=Mer, 3=Gio, 4=Ven, 5=Sab, 6=Dom)
-- -----------------------------------------------------
INSERT IGNORE INTO opening_hours (day_of_week, open_time, close_time, is_closed)
VALUES
(0, '09:00:00', '23:00:00', 0),
(1, '09:00:00', '23:00:00', 0),
(2, '09:00:00', '23:00:00', 0),
(3, '09:00:00', '23:00:00', 0),
(4, '09:00:00', '23:00:00', 0),
(5, '09:00:00', '23:00:00', 0),
(6, '09:00:00', '23:00:00', 0);