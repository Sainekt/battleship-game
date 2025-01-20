import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const HOSTNAME = '0.0.0.0';
const PORT = 3000;
const app = next({ dev, HOSTNAME, PORT });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer, {
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000,
            skipMiddlewares: true,
        },
    });

    io.on('connection', (socket) => {
        // TODO : add reconect
        // if (socket.recovered) {
        //     console.log('Client reconnected');
        // } else {
        //     console.log('not recinnected');
        // }
        console.log(`Connection: ${socket.id}`);

        socket.on('createRoom', (username) => {
            socket.join(username);
            socket.emit('roomCreated', username);
            socket.roomId = username;
        });

        socket.on('joinRoom', (roomId, username) => {
            const room = io.of('/').adapter.rooms.get(roomId);
            if (!room) {
                return socket.emit('notFound', roomId);
            }

            if (room.size >= 2) {
                return socket.emit('roomFull', roomId);
            }
            socket.join(roomId);
            socket.roomId = roomId;
            socket.to(roomId).emit('joinedRoom', username);
        });
        socket.on('getRoomArray', () => {
            const roomsMap = io.of('/').adapter.rooms;
            const roomsIds = roomsMap.keys();
            const sockets = new Set(io.sockets.sockets.keys());
            const rooms = [];
            for (const roomId of roomsIds) {
                if (!sockets.has(roomId) && roomsMap.get(roomId).size < 2) {
                    rooms.push(roomId);
                }
            }
            socket.emit('getRoomArray', rooms);
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
        socket.on('checkStart', (status) => {
            io.to(socket.roomId).emit('checkStart', status);
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

        socket.on('setWinner', (winner) => {
            io.to(socket.roomId).emit('setWinner', winner);
        });

        socket.on('leaveRoom', (username) => {
            console.log(`User left room: ${username}`);
            console.log(socket.roomId);

            if (socket.roomId === username) {
                socket.leave(socket.roomId);
                socket.to(socket.roomId).emit('leaveRoom', 'admin');
            } else {
                socket.leave(socket.roomId);
                socket.to(socket.roomId).emit('leaveRoom', 'player');
            }
        });

        socket.on('disconnect', () => {
            console.log(`Disconnected ${socket.id}`);
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
