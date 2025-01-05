'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { gameState } from '../context/Context';

const socket = io();

export default function Createroom() {
    const { roomId, setRoomId, setPlayer1, setPlayer2, player1, player2 } =
        gameState((state) => state);

    useEffect(() => {
        socket.on('roomCreated', (data) => {
            setRoomId(data[0]);
            setPlayer1(data[1]);
            console.log(`Room created: ${data[0]}`);
        });

        socket.on('joinedRoom', (data) => {
            setRoomId(data[0]);
            console.log(player1);

            setPlayer1(player1);
            setPlayer2(data[1]);
            console.log(`Joined room: ${data[0]}`);
        });

        socket.on('roomFull', (id) => {
            alert(`Room ${id} is full`);
        });
        socket.on('notFound', (id) => {
            alert(`Room ${id} not found`);
        });
        socket.on('alreadyInRoom', (id) => {
            alert(`you are already in the room ${id}`);
        });

        return () => {
            socket.off('roomCreated');
            socket.off('joinedRoom');
            socket.off('roomFull');
        };
    }, [player1, player2]);

    const handleCreateRoom = () => {
        socket.emit('createRoom');
    };

    const handleJoinRoom = () => {
        const id = prompt('Enter room ID:');
        if (id) {
            socket.emit('joinRoom', id);
        }
    };

    return (
        <>
            <h2>Room ID: {roomId || 'No room'}</h2>
            <button onClick={handleCreateRoom}>Create Room</button>
            <button onClick={handleJoinRoom}>Join Room</button>
            {player1} vs {player2}
        </>
    );
}
