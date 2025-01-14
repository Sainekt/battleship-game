import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
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

        socket.on('shot', (shot) => {
            socket.to(socket.roomId).emit('shot', shot);
        });

        socket.on('updateState', (gameState) => {
            socket.to(gameState.roomId).emit('loadState', gameState);
        });

        socket.on('sendState', (gameState) => {
            socket.to(gameState.roomId).emit('sendState', gameState);
        });
        socket.on('checkStart', (status) => {
            io.to(socket.roomId).emit('checkStart', status);
        });
        socket.on('setMotion', (users) => {
            const player = users[Math.floor(Math.random() * users.length)];
            io.to(socket.roomId).emit('setMotion', player);
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
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
