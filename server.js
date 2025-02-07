import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import pkg from '@next/env';
const { loadEnvConfig } = pkg;
const dir = process.cwd();
loadEnvConfig(dir);

const dev = process.env.NODE_ENV !== 'production';
const HOSTNAME = '0.0.0.0';
const PORT = 3000;
const app = next({ dev, HOSTNAME, PORT });
const handler = app.getRequestHandler();
const DOMAIN = process.env.DOMAIN;
const SYSTEM_TOKEN = process.env.SYSTEM_TOKEN;
const HEADERS = {
    'Content-Type': 'application/json',
    authorization: `Bearer ${SYSTEM_TOKEN}`,
};

app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer, {
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000,
            skipMiddlewares: true,
        },
    });
    const CLOSED_ROOMS = new Set();
    const PlayersBoards = {};
    io.on('connection', (socket) => {
        console.log(`Connected ${socket.id}`);

        socket.on('joinRoomReconnect', ({ roomId, username }) => {
            const room = io.of('/').adapter.rooms.get(roomId);
            if (!room) {
                return socket.emit('notFound', roomId);
            }
            socket.roomId = roomId;
            socket.username = username;
            socket.join(roomId);
            socket.to(socket.roomId).emit('requestGameState');
        });
        socket.on('setReconnectState', (state) => {
            socket.to(socket.roomId).emit('setReconnectState', state);
        });

        socket.on('checkGameSquares', (squares) => {
            const startSquares = PlayersBoards[socket.username];
            validReconnectSquares(startSquares, squares).then((result) => {
                if (!result) {
                    socket.emit('Cheating', {
                        reason: 'Data Tampering',
                        details:
                            'The positions of the ships have been changed!',
                    });
                }
            });
        });

        // room and connect
        socket.on('createRoom', (username) => {
            CLOSED_ROOMS.delete(username);
            socket.username = username;
            socket.join(username);
            socket.emit('roomCreated', username);
            socket.roomId = username;
        });
        socket.on('checkRoom', (roomId, username) => {
            const room = io.of('/').adapter.rooms.get(roomId);
            if (!room) {
                return socket.emit('notFound', roomId);
            }
            if (room.size >= 2) {
                return socket.emit('roomFull', roomId);
            }
            socket.to(roomId).emit('checkRoom', username, socket.id);
        });

        socket.on('rejectJoin', (socketId) => {
            socket.to(socketId).emit('rejectJoin');
        });
        socket.on('acceptJoin', (socketId, roomId) => {
            socket.to(socketId).emit('acceptJoin', roomId);
        });
        socket.on('joinRoom', (roomId, username) => {
            const room = io.of('/').adapter.rooms.get(roomId);
            if (!room) {
                return socket.emit('notFound', roomId);
            }

            if (room.size >= 2) {
                return socket.emit('roomFull', roomId);
            }
            if (socket.roomId) {
                socket.leave(socket.roomId);
            }
            socket.join(roomId);
            socket.roomId = roomId;
            socket.username = username;
            socket.to(roomId).emit('joinedRoom', username);
        });
        socket.on('getRoomArray', () => {
            const roomsMap = io.of('/').adapter.rooms;
            const roomsIds = roomsMap.keys();
            const sockets = new Set(io.sockets.sockets.keys());
            const rooms = [];
            for (const roomId of roomsIds) {
                if (
                    !sockets.has(roomId) &&
                    roomsMap.get(roomId).size < 2 &&
                    !CLOSED_ROOMS.has(roomId)
                ) {
                    rooms.push(roomId);
                }
            }
            socket.emit('getRoomArray', rooms);
        });
        socket.on('updateUserData', () => {
            io.to(socket.roomId).emit('updateUserData');
        });
        socket.on('leaveRoom', (username) => {
            socket.leave(socket.roomId);
            socket.to(socket.roomId).emit('leaveRoom', username);
        });
        socket.on('kick', () => {
            socket.to(socket.roomId).emit('kick');
        });

        socket.on('disconnect', (reason) => {
            console.log(`Disconnected ${socket.id}`);
            socket.to(socket.roomId).emit('playerDisconnect', socket.username);
        });

        // Game
        socket.on('saveMyBoard', (squares) => {
            PlayersBoards[socket.username] = squares;
        });
        socket.on('shot', (shot) => {
            socket.to(socket.roomId).emit('shot', shot);
        });
        socket.on('hitOrMiss', (shot) => {
            socket.to(socket.roomId).emit('hitOrMiss', shot);
        });

        socket.on('updateState', (gameState) => {
            socket.to(socket.roomId).emit('loadState', gameState);
        });

        socket.on('sendState', (gameState) => {
            socket.to(socket.roomId).emit('sendState', gameState);
        });
        socket.on('setMotion', (users) => {
            const player = users[Math.floor(Math.random() * users.length)];
            io.to(socket.roomId).emit('setMotion', player);
        });
        socket.on('setTimer', (time) => {
            io.to(socket.roomId).emit('setTimer', time);
        });
        socket.on('changeMotion', (motion) => {
            io.to(socket.roomId).emit('changeMotion', motion);
        });
        socket.on('createGame', ({ player1, player2 }) => {
            fetch(`${DOMAIN}/api/games/`, {
                headers: HEADERS,
                method: 'POST',
                body: JSON.stringify({ player_1: player1, player_2: player2 }),
            })
                .then(async (response) => {
                    let data;
                    if (response.status === 201) {
                        data = await response.json();
                    } else {
                        data = false;
                    }
                    io.to(socket.roomId).emit('setGameId', data);
                })
                .catch((err) => {
                    console.log(err);
                    io.to(socket.roomId).emit('setGameId', false);
                });
        });
        socket.on('checkWinnerState', ({ opponentName, squares }) => {
            const opponentStartSquares = PlayersBoards[opponentName];
            testSquares(opponentStartSquares, squares).then((bool) => {
                if (bool) {
                    socket.emit('acceptWin');
                } else {
                    socket.emit('Cheating', {
                        reason: 'Data Tampering',
                        details:
                            'You said you won, but the starting position of the enemy ships does not match the final one!',
                    });
                }
            });
        });

        socket.on('setWinner', ({ winnerId, winnerName, gameId }) => {
            updateGame(gameId, winnerId);
            CLOSED_ROOMS.delete(socket.roomId);
            io.to(socket.roomId).emit('setWinner', { winnerName });
        });
        socket.on('tehnicalWin', () => {
            socket.to(socket.roomId).emit('tehnicalWin');
        });
        socket.on('checkStart', (status) => {
            if (status) {
                CLOSED_ROOMS.add(socket.roomId);
            } else {
                CLOSED_ROOMS.delete(socket.roomId);
            }
            io.to(socket.roomId).emit('checkStart', status);
        });

        // Rematch
        socket.on('rematch', () => {
            socket.to(socket.roomId).emit('rematch');
        });
        socket.on('acceptRematch', () => {
            io.to(socket.roomId).emit('acceptRematch');
            socket.to(socket.roomId).emit('clearRematch');
        });
        socket.on('rejectRematch', () => {
            socket.to(socket.roomId).emit('rejectRematch');
        });
    });

    httpServer
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(PORT, () => {
            console.log(`> Ready on http://${HOSTNAME}:${PORT}`);
        });
});

function updateGame(gameId, winnerId) {
    const body = {
        winner: winnerId,
        status: 'finished',
        score: 90,
    };
    fetch(`${DOMAIN}/api/games/${gameId}`, {
        headers: HEADERS,
        method: 'PATCH',
        body: JSON.stringify(body),
    }).catch((err) => {
        console.error(err);
    });
}

async function validReconnectSquares(startSquares, squares) {
    const shipCoords = await getShipsCoords(startSquares);
    const reconnectShipCoords = await getShipsCoords(squares);
    return await testSquares(shipCoords, reconnectShipCoords);
}

async function getShipsCoords(squares) {
    let shipCoords = [];
    squares.forEach((value, index) => {
        if (value && value !== '•') shipCoords.push(index);
    });
    return shipCoords;
}

async function testSquares(coords1, coords2) {
    return (
        coords1.length === coords2.length &&
        coords1.every((value, index) => value === coords2[index])
    );
}
