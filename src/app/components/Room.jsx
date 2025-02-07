'use client';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { gameState, userStore, useStore } from '../context/Context';
import Modal from './Modal';
import Notification from './Notification';
import { checkRoomIdData } from '../utils/utils';
import { CLEAR_BOARD, TIME_FOR_RECONNECT } from '../utils/constants';
import {
    deleteLocalStorageReconnectData,
    getLocalStorageGameData,
} from '../utils/utils';

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
        setStop,
        setEnemyId,
        gameStateReset,
    } = gameState((state) => state);
    const {
        ready,
        setReady,
        setSquares,
        setSquaresBoard2,
        boardsAndReadyReset,
        squares,
    } = useStore((state) => state);
    const { username, id, kickedPlayers, setKickedPlayers } = userStore(
        (state) => state
    );
    const [error, setError] = useState(null); // string;
    const [rematch, setRematch] = useState(false); // bool;
    const [sendRematch, setSendRematch] = useState(false); // bool;
    const [roomTimer, setRoomTimer] = useState(0); // number;
    const [player1Disconnect, setPlayer1Disconnect] = useState(false); // bool;
    const [player2Disconnect, setPlayer2Disconnect] = useState(false); // bool;
    const [winnerNotification, setWinnerNotification] = useState(false); // bool
    const [disconnectNotification, setDisconnectNotification] = useState(false); // bool
    const [rejectedNotification, setRejectedNotification] = useState(false); // bool
    const [kickModal, setKickModal] = useState(false); // bool
    const [kickNotification, setKickNotification] = useState(false); // bool
    const [cheatingNotification, SetCheatingNotification] = useState(false); // bool
    const [cheatingMessage, setCheatingMessage] = useState({});
    const [tehnicalWinNotification, setTehnicalWinNotification] =
        useState(false); // bool
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
            setMotion(state.motion);
            if (state.motion === username) {
                setMove(true);
            }
            setTimer(state.timer);
            setEnemyId(state.id);
            setPlayer1Ready(true);
            setPlayer2Ready(true);
            setReady(true);
            setGame(true);
            const squares = JSON.parse(localStorage.getItem('squares'));
            const gameData = getLocalStorageGameData();
            const gameSquares = gameData['GameSquares'];
            setMyBoard(squares);
            setEnemyBoard(gameData['enemyBoard'] || CLEAR_BOARD);
            setSquares(gameSquares || squares);
            setSquaresBoard2(gameData['gameBoard2'] || CLEAR_BOARD);
            setGameId(Number(gameData['gameId']) || null);
            if (username) {
                socket.emit('checkGameSquares', gameSquares || squares);
            }
        }
        function handleCheating(message) {
            setCheatingMessage(message);
            SetCheatingNotification(true);
            socket.emit('tehnicalWin');
        }
        socket.on('Cheating', handleCheating);
        socket.on('setReconnectState', setReconnectState);
        return () => {
            socket.off('Cheating', handleCheating);
            socket.off('setReconnectState', setReconnectState);
        };
    }, [username]);

    // send state for reconnect player
    useEffect(() => {
        function requestGameState() {
            if (username === roomId) {
                setPlayer2Disconnect(false);
            } else {
                setPlayer1Disconnect(false);
            }
            setStop(false);
            setDisconnectNotification(false);
            const state = {
                roomId,
                player1,
                player2,
                motion,
                timer,
                id,
            };
            socket.emit('setReconnectState', state);
        }
        socket.on('requestGameState', requestGameState);
        return () => {
            socket.off('requestGameState', requestGameState);
        };
    }, [roomId, player1, player2, motion, timer, username, id]);

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
                setDisconnectNotification(true);
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

    useEffect(() => {
        clearInterval(intervalRef.current);
        if (player1Disconnect || player2Disconnect) {
            setRoomTimer(TIME_FOR_RECONNECT);
            intervalRef.current = setInterval(() => {
                setRoomTimer((perv) => {
                    perv -= 1;
                    if (perv === 0) {
                        clearInterval(intervalRef.current);
                        socket.emit('setWinner', {
                            winnerId: id,
                            winnerName: username,
                            gameId,
                        });
                    }
                    return perv;
                });
            }, 1000);
            return;
        }
        clearInterval(intervalRef.current);
        return () => {
            clearInterval(intervalRef.current);
        };
    }, [player1Disconnect, player2Disconnect, id, username, gameId]);

    // Check Winner
    useEffect(() => {
        function handleTehnicalWin() {
            setTehnicalWinNotification(true);
            socket.emit('setWinner', {
                winnerId: id,
                winnerName: username,
                gameId,
            });
        }
        function handleAcceptWin() {
            socket.emit('setWinner', {
                winnerId: id,
                winnerName: username,
                gameId,
            });
        }
        socket.on('tehnicalWin', handleTehnicalWin);
        socket.on('acceptWin', handleAcceptWin);
        return () => {
            socket.off('tehnicalWin', handleTehnicalWin);
            socket.off('acceptWin', handleAcceptWin);
        };
    }, [id, username, gameId]);

    // room
    useEffect(() => {
        function handleRoomCreated(room) {
            setRoomId(room);
            setPlayer1(room);
            setPlayer2(null);
        }

        function handleJoinedRoom(username) {
            setPlayer2(username);
            const state = {
                roomId: roomId,
                player1: player1,
                player2: username,
            };
            socket.emit('updateState', state);
        }
        function handleLoadState(state) {
            setPlayer1(state.player1);
            setPlayer2(state.player2);
            setRoomId(state.roomId);
            deleteLocalStorageReconnectData();
        }

        function listenerLeaveRoom(player) {
            if (ready) {
                setReady();
            }
            if (roomId === player) {
                setPlayer1(null);
                setPlayer2(null);
                setRoomId(null);
                socket.emit('leaveRoom', username);
            } else {
                setPlayer2(null);
            }
            gameStateReset();
            boardsAndReadyReset();
            setSquares(myBoard || squares);
        }
        socket.on('loadState', handleLoadState);
        socket.on('leaveRoom', listenerLeaveRoom);
        socket.on('joinedRoom', handleJoinedRoom);
        socket.on('roomCreated', handleRoomCreated);
        return () => {
            socket.off('roomCreated', handleRoomCreated);
            socket.off('joinedRoom', handleJoinedRoom);
            socket.off('leaveRoom', listenerLeaveRoom);
            socket.off('loadState', handleLoadState);
        };
    }, [roomId, player2, ready, myBoard, username]);

    useEffect(() => {
        function handleKick() {
            setKickNotification(true);
            handleLeaveRoom();
        }

        function handleCheckRoom(username, socketId) {
            if (kickedPlayers.has(username) || game) {
                socket.emit('rejectJoin', socketId);
                return;
            }
            socket.emit('acceptJoin', socketId, roomId);
        }
        function handleAcceptJoin(roomId) {
            socket.emit('joinRoom', roomId, username);
        }
        function handleRejectJoin() {
            setKickNotification(true);
        }
        socket.on('checkRoom', handleCheckRoom);
        socket.on('acceptJoin', handleAcceptJoin);
        socket.on('rejectJoin', handleRejectJoin);
        socket.on('kick', handleKick);
        return () => {
            socket.off('checkRoom', handleCheckRoom);
            socket.off('acceptJoin', handleAcceptJoin);
            socket.off('rejectJoin', handleRejectJoin);
            socket.off('kick', handleKick);
        };
    }, [username, roomId, game]);

    // error
    useEffect(() => {
        let timeoutId;
        function clearError() {
            setError(null);
        }
        function roomFull(id) {
            setError(`Room ${id} is full`);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(clearError, 4000);
        }
        function roomNotFound(id) {
            setError(`Room ${id} not found`);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(clearError, 4000);
            deleteLocalStorageReconnectData();
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
            setRoomTimer(0);
            return;
        }
        setRoomTimer(0);
        intervalRef.current = setInterval(() => {
            setRoomTimer((perv) => perv + 1);
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
            setRejectedNotification(true);
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

    // show notification Winner
    useEffect(() => {
        if (winner) {
            setWinnerNotification(true);
        }
    }, [winner]);
    // room
    function handleCreateRoom() {
        socket.emit('createRoom', username);
        deleteLocalStorageReconnectData();
    }

    function handleJoinRoom() {
        const roomId = prompt('please enter room id');
        if (!roomId) {
            return;
        }
        socket.emit('checkRoom', roomId, username);
    }

    function handleLeaveRoom() {
        setPlayer1(null);
        setPlayer2(null);
        setRoomId(null);
        boardsAndReadyReset();
        gameStateReset();
        setSquares(myBoard || squares);
        socket.emit('leaveRoom', username);
    }

    // rematch
    function handleRematch() {
        socket.emit('rematch');
        setSendRematch(true);
    }
    function acceptRematch() {
        socket.emit('acceptRematch');
        setRematch(false);
    }
    function rejectRematch() {
        socket.emit('rejectRematch');
        setRematch(false);
    }
    //  kick player
    function acceptKick() {
        setKickedPlayers(player2);
        socket.emit('kick');
        setKickModal(false);
    }
    return (
        <>
            <h2>Room ID: {roomId || 'No room'}</h2>
            {winnerNotification ? (
                <Notification
                    handleNotification={() => {
                        if (player1Disconnect || player2Disconnect) {
                            setPlayer1Disconnect(false);
                            setPlayer2Disconnect(false);
                            setStop(false);
                            handleLeaveRoom();
                        }
                        setWinnerNotification(false);
                    }}
                    data={{
                        title: 'Winner',
                        text: `${
                            winner === username ? "You've" : winner
                        } won this game`,
                    }}
                />
            ) : null}
            {disconnectNotification ? (
                <Notification
                    handleNotification={() => setDisconnectNotification(false)}
                    data={{
                        title: 'Player Disconnect',
                        text: `${
                            player1Disconnect ? player1 : player2
                        } has been disconnected Stay in the game!\nIf he do not reconnect within ${TIME_FOR_RECONNECT} 
                        seconds, you will be awarded the victory!`,
                    }}
                />
            ) : null}
            {rejectedNotification ? (
                <Notification
                    handleNotification={() => setRejectedNotification(false)}
                    data={{
                        title: 'Rematch rejected',
                        text: 'Rematch request rejected',
                    }}
                />
            ) : null}
            {rematch ? (
                <Modal
                    data={{
                        title: 'Request for a rematch',
                        text: `Player ${
                            username === player1 ? player2 : player1
                        } offers a rematch\n
                        Do you want to play again?`,
                    }}
                    eventAccept={acceptRematch}
                    eventReject={rejectRematch}
                />
            ) : null}
            {kickModal ? (
                <Modal
                    data={{
                        title: 'Kick player',
                        text: `Do you really want to exclude ${player2} from the room?\n
                            If you confirm, the player will not be able to join you until you refresh the page.`,
                    }}
                    eventAccept={acceptKick}
                    eventReject={() => setKickModal(false)}
                />
            ) : null}
            {kickNotification ? (
                <Notification
                    handleNotification={() => setKickNotification(false)}
                    data={{
                        title: 'Kicked',
                        text: `You have been excluded from the room by the room owner. \n
                        You will be able to join this room again after the owner refreshes the page.`,
                    }}
                />
            ) : null}
            {error ? (
                <Notification
                    handleNotification={() => setError(null)}
                    data={{
                        title: 'Error',
                        text: error,
                    }}
                />
            ) : null}
            {cheatingNotification ? (
                <Notification
                    handleNotification={() => SetCheatingNotification(false)}
                    data={{
                        title: cheatingMessage.reason,
                        text: cheatingMessage.details,
                    }}
                />
            ) : null}
            {tehnicalWinNotification ? (
                <Notification
                    handleNotification={() => setTehnicalWinNotification(false)}
                    data={{
                        title: 'Tehnical win',
                        text: 'Your opponent was caught attempting to cheat.\nYou have been awarded a technical win.',
                    }}
                />
            ) : null}
            {winner ? <button onClick={handleRematch}>Rematch</button> : null}
            {sendRematch ? `Requesting rematch... ${roomTimer}` : null}
            <button onClick={handleCreateRoom} disabled={roomId || !username}>
                Create Room
            </button>
            <button onClick={handleJoinRoom} disabled={roomId || !username}>
                join room
            </button>
            <p>
                Player 1: {player1} {player1Ready ? 'ready' : null}{' '}
                {player1Disconnect ? `disconnected... ${roomTimer}` : null}
            </p>
            <p>
                Player 2: {player2} {player2Ready ? 'ready' : null}{' '}
                {player2Disconnect ? `disconnected... ${roomTimer}` : null}
                {username === player1 && !game && player2 ? (
                    <button onClick={() => setKickModal(true)}>Kick</button>
                ) : null}
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
