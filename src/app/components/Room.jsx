'use client';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { gameState, userStore } from '../context/Context';

export const socket = io();

export default function Createroom() {
    const {
        roomId,
        setRoomId,
        setPlayer1,
        setPlayer2,
        player1Ready,
        player2Ready,
        setPlayer1Ready,
        setPlayer2Ready,
        player1,
        player2,
        winner,
        boardPlayer1,
        boardPlayer2,
        game,
    } = gameState((state) => state);

    const { username } = userStore((state) => state);

    useEffect(() => {
        socket.on('roomCreated', (room) => {
            setRoomId(room);
            setPlayer1(room);
            setPlayer2(null);
            console.log(`Room created: ${room} by ${username}`);
        });

        socket.on('joinedRoom', (username) => {
            setPlayer2(username);
            console.log(`Joined room: ${username}`);
            const state = {
                roomId: roomId,
                player1: player1,
                player2: username,
            };
            socket.emit('updateState', state);
        });
        socket.on('loadState', (state) => {
            setPlayer1(state.player1);
            setPlayer2(state.player2);
            setRoomId(state.roomId);
        });

        socket.on('roomFull', (id) => {
            alert(`Room ${id} is full`);
        });
        socket.on('notFound', (id) => {
            return alert(`Room ${id} not found`);
        });
        socket.on('alreadyInRoom', (id) => {
            alert(`You are already in the room ${id}`);
        });

        socket.on('leaveRoom', (player) => {
            if (player === 'admin') {
                setPlayer1(null);
                setPlayer2(null);
                setRoomId(null);
                socket.emit('leaveRoom', username);
            } else {
                setPlayer2(null);
            }
        });

        return () => {
            socket.off('roomCreated');
            socket.off('joinedRoom');
            socket.off('roomFull');
        };
    }, [roomId, player2]);

    function handleCreateRoom() {
        socket.emit('createRoom', username);
    }

    function handleJoinRoom() {
        const roomId = prompt('please enter room id');
        if (!roomId) {
            return;
        }
        socket.emit('joinRoom', roomId, username);
    }

    function handleLeaveRoom() {
        setPlayer1(null);
        setPlayer2(null);
        setRoomId(null);
        socket.emit('leaveRoom', username);
    }

    return (
        <>
            <h2>Room ID: {roomId || 'No room'}</h2>
            <button onClick={handleCreateRoom} disabled={roomId}>
                Create Room
            </button>
            <button onClick={handleJoinRoom} disabled={roomId}>
                join room
            </button>
            <p>
                Player 1: {player1} {player1Ready ? 'ready' : null}
            </p>
            <p>
                Player 2: {player2} {player2Ready ? 'ready' : null}
            </p>
            <button onClick={handleLeaveRoom} disabled={game || !roomId ? true : false}>
                Leave room
            </button>
        </>
    );
}
