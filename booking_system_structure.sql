CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE lfw2se_users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(15) CHECK (role IN ('reserver', 'administrator')) NOT NULL,
    birthdate DATE NOT NULL,
    user_token UUID UNIQUE DEFAULT uuid_generate_v4()
);

CREATE TABLE lfw2se_resources (
    resource_id SERIAL PRIMARY KEY,
    resource_name VARCHAR(100) NOT NULL,
    resource_description TEXT
);

CREATE TABLE lfw2se_reservations (
    reservation_id SERIAL PRIMARY KEY,
    reserver_token UUID REFERENCES lfw2se_users(user_token) ON DELETE CASCADE,
    resource_id INT REFERENCES lfw2se_resources(resource_id),
    reservation_start TIMESTAMP NOT NULL,
    reservation_end TIMESTAMP NOT NULL,
    CHECK (reservation_end > reservation_start)
);

CREATE TABLE lfw2se_admin_logs (
    log_id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES lfw2se_users(user_id),
    action VARCHAR(255) NOT NULL,
    resource_id INT,
    reservation_id INT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION lfw2se_check_age() RETURNS TRIGGER AS $$
BEGIN
    IF (EXTRACT(YEAR FROM AGE(NEW.reservation_start, (SELECT birthdate FROM lfw2se_users WHERE user_token = NEW.reserver_token))) < 15) THEN
        RAISE EXCEPTION 'User must be over 15 years old to make a reservation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lfw2se_check_age_trigger
BEFORE INSERT ON lfw2se_reservations
FOR EACH ROW
EXECUTE FUNCTION lfw2se_check_age();

CREATE VIEW lfw2se_booked_resources_view AS
SELECT
    r.resource_name,
    res.reservation_start,
    res.reservation_end
FROM
    lfw2se_resources r
JOIN
    lfw2se_reservations res ON r.resource_id = res.resource_id;

CREATE OR REPLACE FUNCTION lfw2se_erase_user(user_id_to_erase INT) RETURNS VOID AS $$
DECLARE
    user_token_to_erase UUID;
BEGIN
    SELECT user_token INTO user_token_to_erase FROM lfw2se_users WHERE user_id = user_id_to_erase;

    DELETE FROM lfw2se_reservations WHERE reserver_token = user_token_to_erase;
    DELETE FROM lfw2se_users WHERE user_id = user_id_to_erase;

    DELETE FROM lfw2se_admin_logs WHERE admin_id = user_id_to_erase;
END;

$$ LANGUAGE plpgsql;
