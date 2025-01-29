'use client';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { gameState, userStore, useStore } from '../context/Context';
import Modal from './Modal';
import Notification from './Notification';
import { checkRoomIdData } from '../utils/utils';
import { CLEAR_BOARD } from '../utils/constants';

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
        gameId,
        timer,
        motion,
        enemyBoard,
        myBoard,
        setGameId,
        setMotion,
        setTimer,
        setEnemyBoard,
        setMyBoard,
        setGame,
        setMove,
        stop,
        setStop,
    } = gameState((state) => state);
    const { ready, setReady, setSquares, setSquaresBoard2 } = useStore(
        (state) => state
    );
    const { username } = userStore((state) => state);
    const [error, setError] = useState(null);
    const [rematch, setRematch] = useState(false);
    const [sendRematch, setSendRematch] = useState(false);
    const [rematchTimer, setRematchTimer] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const [player1Disconnect, setPlayer1Disconnect] = useState(false);
    const [player2Disconnect, setPlayer2Disconnect] = useState(false);
    const [notificationDisconnect, setNotificationDisconnect] = useState(false);
    const intervalRef = useRef(null);

    // reconnect
    useEffect(() => {
        const roomId = checkRoomIdData();
        if (!roomId || !username) {
            return;
        }
        socket.emit('joinRoomReconnect', { roomId, username });
        function setReconnectState(state) {
            setRoomId(state.roomId);
            setPlayer1(state.player1);
            setPlayer2(state.player2);
            setGameId(state.gameId);
            setMotion(state.motion);
            if (state.motion === username) {
                setMove(true);
            }
            setTimer(state.timer);
            setPlayer1Ready(true);
            setPlayer2Ready(true);
            setReady(true);
            setGame(true);
            const squares = JSON.parse(localStorage.getItem('squares'));
            setMyBoard(squares);
            setEnemyBoard(
                JSON.parse(localStorage.getItem('enemyBoard')) || CLEAR_BOARD
            );
            setSquares(
                JSON.parse(localStorage.getItem('GameSquares')) || squares
            );
            setSquaresBoard2(
                JSON.parse(localStorage.getItem('gameBoard2')) || CLEAR_BOARD
            );
        }
        socket.on('setReconnectState', setReconnectState);
        return () => {
            socket.off('setReconnectState', setReconnectState);
        };
    }, [username]);
    useEffect(() => {
        function requestGameState() {
            if (username === roomId) {
                setPlayer2Disconnect(false);
            } else {
                setPlayer1Disconnect(false);
            }
            setNotificationDisconnect(false);
            setStop(false);
            const state = {
                roomId,
                player1,
                player2,
                gameId,
                motion,
                timer,
            };
            socket.emit('setReconnectState', state);
        }
        socket.on('requestGameState', requestGameState);
        return () => {
            socket.off('requestGameState', requestGameState);
        };
    }, [
        roomId,
        player1,
        player2,
        myBoard,
        enemyBoard,
        gameId,
        motion,
        timer,
        username,
    ]);

    // disconnect
    useEffect(() => {
        function handleDisconnect(player) {
            if (game) {
                if (player === roomId) {
                    setPlayer1Disconnect(true);
                } else {
                    setPlayer2Disconnect(true);
                }
                setStop(true);
                setNotificationDisconnect(true);
            } else {
                if (player === roomId) {
                    handleLeaveRoom();
                } else {
                    setPlayer2(null);
                }
            }
        }
        socket.on('playerDisconnect', handleDisconnect);
        return () => {
            socket.off('playerDisconnect', handleDisconnect);
        };
    }, [roomId, game]);

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
    }, [roomId, player2, ready, player1Ready, player2Ready, game]);

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
        setReady(false);
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
    function handleShowNotification(setState, state) {
        setState(!state);
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
            {notificationDisconnect ? (
                <Notification
                    handleNotification={() =>
                        handleShowNotification(
                            setNotificationDisconnect,
                            notificationDisconnect
                        )
                    }
                    data={{
                        title: 'Player Disconnect',
                        text:
                            (player1Disconnect
                                ? `${player1} has been disconnected`
                                : `${player2} has been disconnected`) +
                            '\nStay in the game! If he do not reconnect within 2 minutes, you will be awarded the victory!',
                    }}
                />
            ) : null}
            {showNotification ? (
                <Notification
                    handleNotification={() =>
                        handleShowNotification(
                            setShowNotification,
                            showNotification
                        )
                    }
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
                {player1Disconnect ? 'disconnected...' : null}
            </p>
            <p>
                Player 2: {player2} {player2Ready ? 'ready' : null}{' '}
                {player2Disconnect ? 'disconnected...' : null}
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
