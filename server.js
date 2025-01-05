import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const rooms = {}; // Объект для хранения комнат

app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer, {
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000,
            skipMiddlewares: true,
        },
    });

    io.on('connection', (socket) => {
        if (socket.recovered) {
            console.log('Client reconnected');
        } else {
            console.log('not recinnected');
        }
        console.log(`Connection: ${socket.id}`);

        // Обработка запроса на создание комнаты
        socket.on('createRoom', (username) => {
            const roomId = Math.random().toString(36).substring(2, 8); // Генерация случайного ID комнаты
            const player = { username: username, socketId: socket.id };
            rooms[roomId] = { players: [player] };
            socket.join(roomId); // Подключение игрока к комнате
            console.log(`Room created: ${roomId}`);

            socket.emit('roomCreated', { roomId: roomId, username: username }); // Отправка ID комнаты клиенту
        });

        // Обработка запроса на присоединение к комнате
        socket.on('joinRoom', ({ roomId, username }) => {
            if (!rooms[roomId]) {
                return socket.emit('notFound', roomId);
            }
            if (rooms[roomId].players.find((value) => value === socket.id)) {
                return socket.emit('alreadyInRoom', roomId);
            }
            const player = { username: username, socketId: socket.id };
            if (rooms[roomId].players.length < 2) {
                rooms[roomId].players.push(player); // Добавление игрока в комнату
                socket.join(roomId); // Подключение игрока к комнате
                console.log(`Player ${socket.id} joined room: ${roomId}`);
                socket.emit('joinedRoom', [roomId, rooms[roomId].players]); // Подтверждение присоединения
            } else {
                socket.emit('roomFull', roomId); // Комната полна
            }
        });

        socket.on('disconnect', () => {
            console.log(`Disconnected ${socket.id}`);
            for (const roomId in rooms) {
                rooms[roomId].players = rooms[roomId].players.filter(
                    (value) => value.socketId !== socket.id
                );
                if (rooms[roomId].players.length === 0) {
                    console.log(`room delete: ${roomId}`);
                    delete rooms[roomId];
                }
                console.log(`Player ${socket.id} left room: ${roomId}`);
                break;
            }
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
