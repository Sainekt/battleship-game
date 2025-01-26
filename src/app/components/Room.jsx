'use client';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { gameState, userStore, useStore } from '../context/Context';
import Modal from './Modal';
import Notification from './Notification';

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
    } = gameState((state) => state);
    const { ready, setReady } = useStore((state) => state);
    const { username } = userStore((state) => state);
    const [error, setError] = useState(null);
    const [rematch, setRematch] = useState(false);
    const [sendRematch, setSendRematch] = useState(false);
    const [rematchTimer, setRematchTimer] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const intervalRef = useRef(null);
    // room
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

    // timer for Request rematch
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (!sendRematch) {
            setRematchTimer(0);
            return;
        }
        intervalRef.current = setInterval(() => {
            setRematchTimer((perv) => perv + 1);
        }, 1000);

        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, [sendRematch]);

    //socket handlers for a rematch
    useEffect(() => {
        function handleRejectEvent() {
            clearInterval(intervalRef.current);
            setSendRematch(false);
            setShowNotification(true);
        }
        function clearRematch() {
            clearInterval(intervalRef.current);
            setSendRematch(false);
        }
        function handleRematch() {
            setRematch(true);
        }
        socket.on('rematch', handleRematch);
        socket.on('clearRematch', clearRematch);
        socket.on('rejectRematch', handleRejectEvent);
        return () => {
            socket.off('rematch', handleRematch);
            socket.off('clearRematch', clearRematch);
            socket.off('rejectRematch', handleRejectEvent);
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
        socket.emit('rematch');
        setSendRematch(true);
    }
    function handleModal() {
        setRematch(false);
    }
    function acceptRematch() {
        socket.emit('acceptRematch');
    }
    function rejectRematch() {
        socket.emit('rejectRematch');
    }
    function handleShowNotification() {
        setShowNotification(!showNotification);
    }
    function getDataForModal() {
        return {
            title: 'Request for a rematch',
            text: `Player ${
                username === player1 ? player2 : player1
            } offers a rematch\n
            Do you want to play again?`,
        };
    }

    return (
        <>
            <h2>Room ID: {roomId || 'No room'}</h2>
            {showNotification ? (
                <Notification
                    handleNotification={handleShowNotification}
                    data={{
                        title: 'Notification',
                        text: 'Rematch request rejected',
                    }}
                />
            ) : null}
            {rematch ? (
                <Modal
                    handleModal={handleModal}
                    data={getDataForModal()}
                    eventAccept={acceptRematch}
                    eventReject={rejectRematch}
                />
            ) : null}
            {error ? <h3 style={{ color: 'red' }}>{error}</h3> : null}
            {winner ? <button onClick={handleRematch}>Rematch</button> : null}
            {sendRematch ? `Requesting rematch... ${rematchTimer}` : null}
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
