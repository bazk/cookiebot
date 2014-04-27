CREATE OR REPLACE FUNCTION get_cookies(_username TEXT) RETURNS INTEGER AS
$$
    SELECT ammount FROM cookies WHERE lower(username) = lower(_username);
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION add_cookies(_username TEXT, _ammount INTEGER) RETURNS VOID AS
$$
BEGIN
    IF EXISTS(SELECT ammount FROM cookies WHERE lower(username) = lower(_username)) THEN
        UPDATE cookies SET ammount = ammount + _ammount WHERE lower(username) = lower(_username);
    ELSE
        INSERT INTO cookies (username, ammount) VALUES (lower(_username), _ammount);
    END IF;
END;
$$
LANGUAGE 'plpgsql';