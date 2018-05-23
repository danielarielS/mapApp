DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS friendships;
DROP TABLE IF EXISTS pins CASCADE;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(250) NOT NULL,
    last VARCHAR(250) NOT NULL,
    email VARCHAR(250) NOT NULL UNIQUE,
    pass VARCHAR(250) NOT NULL,
    profilepic VARCHAR(250),
    bio VARCHAR(1250),
    sex VARCHAR(50)
);

CREATE TABLE friendships(
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    status INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pins(
    id SERIAL PRIMARY KEY,
    title VARCHAR(250) ,
    category VARCHAR(250),
    url VARCHAR(250),
    lat VARCHAR(250),
    lng VARCHAR(250),
    description VARCHAR(1250),
    color VARCHAR(250),
    user_id INTEGER, FOREIGN KEY(user_id) REFERENCES users (id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- friendship status
-- 1 - pending
-- 2 - accepted
-- 3 - canceled
-- 4 - terminated
-- 5 - rejected
