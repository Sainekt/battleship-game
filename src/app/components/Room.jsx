'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { gameState, userStore, useStore } from '../context/Context';

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
        game,
        winner,
        rematch,
        setRematch,
    } = gameState((state) => state);
    const { ready, setReady } = useStore((state) => state);
    const { username } = userStore((state) => state);
    const [error, setError] = useState(null);

    useEffect(() => {
        socket.on('roomCreated', (room) => {
            setRoomId(room);
            setPlayer1(room);
            setPlayer2(null);
        });

        socket.on('joinedRoom', (username) => {
            setPlayer2(username);
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

        socket.on('leaveRoom', (player) => {
            if (ready) {
                setReady();
            }
            if (roomId === player) {
                setPlayer1(null);
                setPlayer2(null);
                setRoomId(null);
                setPlayer1Ready(false);
                setPlayer2Ready(false);
                socket.emit('leaveRoom', username);
            } else {
                setPlayer1Ready(false);
                setPlayer2Ready(false);
                setPlayer2(null);
            }
        });

        return () => {
            socket.off('roomCreated');
            socket.off('joinedRoom');
            socket.off('roomFull');
            socket.off('leaveRoom');
            socket.off('loadState');
        };
    }, [roomId, player2, ready, player1Ready, player2Ready]);

    // error
    useEffect(() => {
        let timeoutId;
        function clearError() {
            setError(null);
        }

        function roomFull(id) {
            setError(`Room ${id} is full`);
            timeoutId = setTimeout(clearError, 4000);
        }
        function roomNotFound(id) {
            setError(`Room ${id} not found`);
            timeoutId = setTimeout(clearError, 4000);
        }

        socket.on('roomFull', roomFull);
        socket.on('notFound', roomNotFound);

        return () => {
            socket.off('roomFull', roomFull);
            socket.off('notFound', roomNotFound);
            clearTimeout(timeoutId);
        };
    }, []);

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
        if (ready) {
            setReady();
        }
        setPlayer1(null);
        setPlayer1Ready(false);
        setPlayer2Ready(false);
        setPlayer2(null);
        setRoomId(null);
        socket.emit('leaveRoom', username);
    }
    function handleRematch() {
        setRematch(true);
        socket.emit('rematch');
    }

    return (
        <>
            <h2>Room ID: {roomId || 'No room'}</h2>
            {error ? <h3 style={{ color: 'red' }}>{error}</h3> : null}
            {!winner ? (
                <button onClick={handleRematch} disabled={rematch}>
                    Rematch
                </button>
            ) : null}
            <button onClick={handleCreateRoom} disabled={roomId || !username}>
                Create Room
            </button>
            <button onClick={handleJoinRoom} disabled={roomId || !username}>
                join room
            </button>
            <p>
                Player 1: {player1} {player1Ready ? 'ready' : null}{' '}
            </p>
            <p>
                Player 2: {player2} {player2Ready ? 'ready' : null}{' '}
            </p>
            <button
                onClick={handleLeaveRoom}
                disabled={game || !roomId ? true : false}
            >
                Leave room
            </button>
        </>
    );
}
