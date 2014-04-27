CREATE TABLE cookies (
    username TEXT,
    ammount INTEGER DEFAULT 0
);

CREATE UNIQUE INDEX lower_case_username ON cookies (lower(username));