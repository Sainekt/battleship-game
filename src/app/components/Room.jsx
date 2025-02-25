'use client';
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { io } from 'socket.io-client';
import { gameState, userStore, useStore } from '../context/Context';
import Modal from './Modal';
import Notification from './Notification';
import { AnimateButton } from './AnimateButton';
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
        playerMove,
        myBoard,
        setGameId,
        setPlayerMove,
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
            setPlayerMove(state.playerMove);
            if (state.playerMove === username) {
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
            setMyBoard(squares);
            setEnemyBoard(gameData['enemyBoard'] || CLEAR_BOARD);
            setSquares(gameData['GameSquares'] || squares);
            setSquaresBoard2(gameData['gameBoard2'] || CLEAR_BOARD);
            setGameId(Number(gameData['gameId']) || null);
        }
        socket.on('setReconnectState', setReconnectState);
        return () => {
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
                playerMove,
                timer,
                id,
            };
            socket.emit('setReconnectState', state);
        }
        socket.on('requestGameState', requestGameState);
        return () => {
            socket.off('requestGameState', requestGameState);
        };
    }, [roomId, player1, player2, playerMove, timer, username, id]);

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
            <div className='bg-gray-50 border rounded-lg p-3 m-2  min-w-52 overflow-hidden'>
                <div className='text-center border-2 rounded-lg bg-white'>
                    <span className='font-bold text-gray-800'>Room ID: </span>
                    <br />
                    <span className='text-blue-500 font-bold'>
                        {roomId || 'No room'}
                    </span>
                </div>
                <AnimatePresence initial={false}>
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
                </AnimatePresence>
                <AnimatePresence initial={false}>
                    {disconnectNotification ? (
                        <Notification
                            handleNotification={() =>
                                setDisconnectNotification(false)
                            }
                            data={{
                                title: 'Player Disconnect',
                                text: `${
                                    player1Disconnect ? player1 : player2
                                } has been disconnected Stay in the game!\nIf he do not reconnect within ${TIME_FOR_RECONNECT} 
                        seconds, you will be awarded the victory!`,
                            }}
                        />
                    ) : null}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                    {rejectedNotification ? (
                        <Notification
                            handleNotification={() =>
                                setRejectedNotification(false)
                            }
                            data={{
                                title: 'Rematch rejected',
                                text: 'Rematch request rejected',
                            }}
                        />
                    ) : null}
                </AnimatePresence>
                <AnimatePresence initial={false}>
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
                </AnimatePresence>
                <AnimatePresence initial={false}>
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
                    ) : null}{' '}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                    {kickNotification ? (
                        <Notification
                            handleNotification={() =>
                                setKickNotification(false)
                            }
                            data={{
                                title: 'Kicked',
                                text: `You have been excluded from the room by the room owner. \n
                        You will be able to join this room again after the owner refreshes the page.`,
                            }}
                        />
                    ) : null}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                    {error ? (
                        <Notification
                            handleNotification={() => setError(null)}
                            data={{
                                title: 'Error',
                                text: error,
                            }}
                        />
                    ) : null}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                    {winner ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            key='rematchButton'
                        >
                            <AnimateButton
                                className='bg-blue-500 p-1 rounded-full text-white text-sm my-1 disabled:bg-gray-400 
                        disabled:cursor-not-allowed hover:bg-blue-700 w-full'
                                onClick={handleRematch}
                                title={'Rematch'}
                            ></AnimateButton>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
                {sendRematch ? (
                    <>
                        <div className='text-blue-500 text-center '>
                            Requesting rematch... {roomTimer}
                        </div>
                    </>
                ) : null}
                <div className='flex-row justify-between'>
                    <AnimateButton
                        className='bg-blue-500 p-1 rounded-full text-white text-sm my-1 disabled:bg-gray-400 
                        disabled:cursor-not-allowed hover:bg-blue-700 w-full'
                        onClick={handleCreateRoom}
                        disabled={roomId || !username}
                        title={'Create room'}
                    ></AnimateButton>
                    <AnimateButton
                        className='bg-blue-500 p-1 rounded-full text-white text-sm my-1 w-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700'
                        onClick={handleJoinRoom}
                        disabled={roomId || !username}
                        title={'Join room'}
                    ></AnimateButton>
                </div>
                {roomId ? (
                    <div className='flex flex-col items-center justify-center'>
                        <div className='flex items-center'>
                            <span className='max-w-48 min-w-12 overflow-x-hidden flex-1 text-center'>
                                {player1}
                            </span>
                            <span className='text-blue-500 ml-1'>
                                {player1Ready && !game ? 'ready' : null}
                            </span>
                            <span className='text-red-500'>
                                {player1Disconnect
                                    ? `disconnected... ${roomTimer}`
                                    : null}
                            </span>
                        </div>
                        {player2 ? (
                            <span className='font-bold text-red-500'>VS</span>
                        ) : null}
                        <div className='flex items-center'>
                            <span className='max-w-48 min-w-12 overflow-x-hidden flex-1 text-center'>
                                {player2}
                            </span>
                            <span className='text-blue-500 ml-1'>
                                {player2Ready && !game ? 'ready' : null}
                            </span>
                            <span className='text-red-500'>
                                {player2Disconnect
                                    ? `disconnected... ${roomTimer}`
                                    : null}
                            </span>
                        </div>
                    </div>
                ) : null}
                <AnimatePresence initial={false}>
                    {username === player1 && !game && player2 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            key='kickButton'
                        >
                            <button
                                className='bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 max-h-8 w-full overflow-hidden transition duration-200
                        text-sm'
                                onClick={() => setKickModal(true)}
                            >
                                Kick {player2}
                            </button>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
                <AnimateButton
                    className='bg-red-500 hover:bg-red-600 text-white rounded-full p-1 w-full my-1 text-sm
                    disabled:bg-gray-400 disabled:cursor-not-allowed'
                    onClick={handleLeaveRoom}
                    disabled={game || !roomId ? true : false}
                    title={'Leave room'}
                ></AnimateButton>
            </div>
        </>
    );
}
