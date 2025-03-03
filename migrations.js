import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_TCP_PORT || 3306,
});

// So far, only for creating tables.
async function migrations() {
    try {
        await createUsersTable();
        await createGamesTable();
        console.log('The database tables are ready.');
    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        await connection.end();
    }
}

async function createGamesTable() {
    const games = `
        CREATE TABLE IF NOT EXISTS games (
            id int NOT NULL AUTO_INCREMENT,
            player_1 int NOT NULL,
            player_2 int NOT NULL,
            winner int DEFAULT NULL,
            status varchar(50) DEFAULT NULL,
            score int DEFAULT NULL,
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY player_1 (player_1),
            KEY player_2 (player_2),
            KEY winner (winner),
            CONSTRAINT games_ibfk_1 FOREIGN KEY (player_1) REFERENCES users (id),
            CONSTRAINT games_ibfk_2 FOREIGN KEY (player_2) REFERENCES users (id),
            CONSTRAINT games_ibfk_3 FOREIGN KEY (winner) REFERENCES users (id)
        ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;
    await connection.query(games);
    console.log('Games table is OK.');
}

async function createUsersTable() {
    const users = `
        CREATE TABLE IF NOT EXISTS users (
            id int NOT NULL AUTO_INCREMENT,
            username varchar(255) NOT NULL,
            email varchar(255) DEFAULT NULL,
            password varchar(255) NOT NULL,
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_username (username),
            UNIQUE KEY unique_email (email)
        ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;
    await connection.query(users);
    console.log('Users table is OK.');
}

await migrations();
