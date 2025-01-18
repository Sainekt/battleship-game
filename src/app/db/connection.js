'use server';
import mysql from 'mysql2';
import { hashPassword } from '../security/password.js';
import { date } from 'zod';

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

function createTableUsers() {
    const sql = `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT unique_username UNIQUE (username),
        CONSTRAINT unique_email UNIQUE (email)
    );`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            console.log(results);
        }
    });
}

function createTableGames() {
    const sql = `CREATE TABLE IF NOT EXISTS games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_1 INT NOT NULL,
    player_2 INT NOT NULL,
    winner INT,
    status VARCHAR(50),
    score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_1) REFERENCES users(id),
    FOREIGN KEY (player_2) REFERENCES users(id),
    FOREIGN KEY (winner) REFERENCES users(id)
    );`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            console.log(results);
        }
    });
}

function createTables() {
    createTableUsers();
    createTableGames();
    connection.end();
}

export async function createUser(username, password, email = null) {
    const hashedPassword = await hashPassword(password);
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO users(username, password, email) VALUES(?, ?, ?)`;
        connection.query(
            sql,
            [username, hashedPassword, email],
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

export async function getUser(username) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, username, password, email FROM users WHERE username = ?`;
        connection.query(sql, [username], (err, results) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(results);
            }
        });
    });
}

export async function createGame(player_1, player_2) {
    try {
        const player1 = await getUser(player_1);
        const player2 = await getUser(player_2);
        const player1_id = player1[0].id;
        const player2_id = player2[0].id;
        const sql = `INSERT INTO games(player_1, player_2, status) VALUES(?, ?, ?)`;
        return new Promise((resolve, reject) => {
            connection.query(
                sql,
                [player1_id, player2_id, 'in process'],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        return resolve(result.insertId);
                    }
                }
            );
        });
    } catch (err) {
        console.log(`error: ${err}`);
    }
}

export async function updateGame(gameId, status, winner, score) {
    try {
        const winner_obj = await getUser(winner);
        const winner_id = winner_obj[0].id;
        const sql = `UPDATE games SET status = ?, winner = ?, score = ? WHERE id = ?`;
        return new Promise((resolve, reject) => {
            connection.query(
                sql,
                [status, winner_id, score, gameId],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        return resolve(result);
                    }
                }
            );
        });
    } catch (err) {
        console.log(`error: ${err}`);
    }
}

export async function getUserById(id) {
    try {
        const sql = `SELECT * FROM users WHERE id = ?`;
        return new Promise((resolve, reject) => {
            connection.query(sql, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    return resolve(result);
                }
            });
        });
    } catch (err) {
        console.log(`error: ${err}`);
    }
}

function getStats(userId, games) {
    const victories = games.reduce((accum, current) => {
        if (current.winner === userId) {
            return accum + 1;
        }
        return accum;
    }, 0);
    const losses = games.length - victories;
    const avg = losses > 0 ? victories / losses : 0;
    return {
        countGames: games.length,
        victories: victories,
        losses: losses,
        avg: avg,
    };
}

export async function getUserAllInfo(username) {
    return new Promise((resolve, reject) => {
        const sql = `
        SELECT 
            users.id,
            users.username, 
            users.email, 
            games.id AS gameId, 
            games.player_1,
            games.player_2,
            games.winner,
            games.status,
            games.score,
            games.created_at,
            games.updated_at
        FROM users 
        LEFT JOIN games ON users.id = games.player_1 OR users.id = games.player_2
        WHERE username = ?`;
        connection.query(sql, [username], (err, results) => {
            if (err) {
                return reject(err);
            } else {
                const data = {
                    id: results[0].id,
                    username: results[0].username,
                    email: results[0].email,
                    games: [],
                };
                if (results[0].gameId) {
                    data.games = results.map((game) => ({
                        id: game.gameId,
                        player_1: game.player_1,
                        player_2: game.player_2,
                        winner: game.winner,
                        status: game.status,
                        score: game.score,
                        created_at: game.created_at,
                        updated_at: game.updated_at,
                    }));
                }
                const result = { ...data, ...getStats(data.id, data.games) };
                return resolve(result);
            }
        });
    });
}
