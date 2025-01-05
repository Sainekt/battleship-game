'use client';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { gameState, userStore } from '../context/Context';

const socket = io();

export default function Createroom() {
    const { roomId, setRoomId, setPlayer1, setPlayer2, player1, player2 } =
        gameState((state) => state);
    const { username } = userStore((state) => state);

    useEffect(() => {
        // Слушаем событие создания комнаты
        socket.on('roomCreated', (data) => {
            setRoomId(data.roomId);
            setPlayer1(data.username);
            setPlayer2(null); // Сбрасываем имя второго игрока
            console.log(`Room created: ${data.roomId} by ${data.username}`);
        });

        // Слушаем событие присоединения к комнате
        socket.on('joinedRoom', (data) => {
            setRoomId(data[0]);

            setPlayer1(data[1][0].username); // Устанавливаем имя первого игрока
            setPlayer2(data[1][1]?.username || null); // Устанавливаем имя второго игрока, если он есть
            console.log(`Joined room: ${data.roomId}`);
        });

        // Обработка других событий
        socket.on('roomFull', (id) => {
            alert(`Room ${id} is full`);
        });
        socket.on('notFound', (id) => {
            alert(`Room ${id} not found`);
        });
        socket.on('alreadyInRoom', (id) => {
            alert(`You are already in the room ${id}`);
        });

        return () => {
            // Очистка обработчиков событий при размонтировании компонента
            socket.off('roomCreated');
            socket.off('joinedRoom');
            socket.off('roomFull');
        };
    }, [setPlayer1, setPlayer2, setRoomId]);

    const handleCreateRoom = () => {
        socket.emit('createRoom', username); // Отправляем имя пользователя на сервер
    };

    const handleJoinRoom = () => {
        const roomId = prompt('Enter room ID:');
        if (roomId) {
            socket.emit('joinRoom', { roomId, username }); // Отправляем ID комнаты и имя пользователя на сервер
        }
    };

    return (
        <>
            <h2>Room ID: {roomId || 'No room'}</h2>
            <button onClick={handleCreateRoom}>Create Room</button>
            <button onClick={handleJoinRoom}>Join Room</button>
            <p>Player 1: {player1}</p>
            <p>Player 2: {player2}</p>
        </>
    );
}
