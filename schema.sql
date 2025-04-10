CREATE TABLE spaces (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        spaceId TEXT NOT NULL UNIQUE,
                        spaceKeyHash TEXT NOT NULL
);

CREATE TABLE content (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                spaceId TEXT NOT NULL,
                                name TEXT NOT NULL,
                                type TEXT NOT NULL,
                                encryptedValue TEXT NOT NULL,
                                FOREIGN KEY (spaceId) REFERENCES spaces(spaceId)
);
