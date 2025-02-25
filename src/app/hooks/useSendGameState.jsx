'use client';

import { useEffect } from 'react';
import { gameState, userStore, useStore } from '../context/Context';
import { socket } from '../components/Room';
import { TIME_FOR_MOTION, FLEET, CLEAR_BOARD } from '../utils/constants';
import {
    setLocalStorageRoomId,
    deleteLocalStorageReconnectData,
    updateLocalStorageGameData,
} from '../utils/utils';

export default function useSendGameState() {
    const {
        roomId,
        player1Ready,
        player2Ready,
        player1,
        player2,
        setPlayer1,
        setPlayer2,
        setPlayer1Ready,
        setPlayer2Ready,
        game,
        gameId,
        setGame,
        playerMove,
        setPlayerMove,
        setTimer,
        setMove,
        setWinner,
        setGameId,
        enemyId,
        setEnemyId,
        myBoard,
        gameStateReset,
        setMyBoard,
    } = gameState((state) => state);
    const { username, id: userId } = userStore((state) => state);
    const {
        ready,
        setSquares,
        checkAllShipPlaced,
        boardsAndReadyReset,
        boardRematchReset,
    } = useStore((state) => state);
    const state = {
        player1,
        player2,
        player1Ready,
        player2Ready,
        userId,
        gameId,
    };
    function RematchStateUpdate() {
        gameStateReset();
        setMyBoard(null);
        boardRematchReset();
        checkAllShipPlaced();
    }
    function gameReset() {
        gameStateReset();
        boardsAndReadyReset();
        setSquares(myBoard);
        checkAllShipPlaced();
    }
    useEffect(() => {
        function handleReceivingState(state) {
            if (username === roomId) {
                setEnemyId(state.userId);
            } else {
                setEnemyId(state.userId);
            }
            setGameId(gameId || state.gameId);
            setGameId(gameId || state.gameId);
            setPlayer1Ready(state.player1Ready);
            setPlayer2Ready(state.player2Ready);
            setPlayer1(state.player1);
            setPlayer2(state.player2);
        }
        function handleSetWinner({ winnerName }) {
            setWinner(winnerName);
            setPlayerMove(null);
            setTimer(0);
            setGame(false);
            socket.emit('updateUserData');
            deleteLocalStorageReconnectData();
        }

        function handleSetMotion(user) {
            if (!playerMove) {
                setPlayerMove(user);
            }
        }
        function handeSetTimer(time) {
            setTimer(time);
            if (username === playerMove) {
                setMove(true);
            } else {
                setMove(false);
            }
            setLocalStorageRoomId(roomId);
        }
        function handleChangeMotion(playerMove) {
            if (playerMove === player1) {
                setPlayerMove(player2);
            } else {
                setPlayerMove(player1);
            }
            socket.emit('setTimer', TIME_FOR_MOTION);
        }
        function checkStart(check) {
            deleteLocalStorageReconnectData();
            let timeOut;
            if (ready && check) {
                setGame(true);
                setTimer(0);
                if (username === roomId) {
                    socket.emit('setPlayerMove', [player1, player2]);
                    timeOut = setTimeout(() => {
                        socket.emit('createGame', { player1, player2 });
                    }, 1000);
                }
            } else {
                setGame(false);
                clearTimeout(timeOut);
            }
        }
        function acceptRematch() {
            RematchStateUpdate();
        }
        function setGameIdOrStopGame(gameId) {
            if (gameId) {
                setGameId(gameId.gameId);
                updateLocalStorageGameData('gameId', gameId.gameId);
                return;
            }
            gameReset();
        }

        if (roomId) {
            socket.emit('sendState', state);
            socket.on('sendState', handleReceivingState);
        }
        if (game) {
            socket.on('setPlayerMove', handleSetMotion);
        }
        socket.on('setTimer', handeSetTimer);
        socket.on('changeMotion', handleChangeMotion);
        socket.on('setWinner', handleSetWinner);
        socket.on('checkStart', checkStart);
        socket.on('acceptRematch', acceptRematch);
        socket.on('setGameId', setGameIdOrStopGame);

        return () => {
            socket.off('setGameId', setGameIdOrStopGame);
            socket.off('acceptRematch', acceptRematch);
            socket.off('setWinner', handleSetWinner);
            socket.off('changeMotion', handleChangeMotion);
            socket.off('setTimer', handeSetTimer);
            socket.off('sendState', handleReceivingState);
            socket.off('checkStart', checkStart);
            socket.off('setPlayerMove', handleSetMotion);
        };
    }, [
        roomId,
        player1Ready,
        player2Ready,
        game,
        playerMove,
        ready,
        gameId,
        enemyId,
    ]);
}
