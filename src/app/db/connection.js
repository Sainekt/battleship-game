'use server';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import { hashPassword, comparePassword } from '../security/password.js';

dotenv.config({ path: '../../../.env' });

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

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
        const sql = `SELECT id, username, email FROM users WHERE username = ?`;
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
