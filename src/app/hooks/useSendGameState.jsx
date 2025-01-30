'use client';

import { useEffect, useState, useRef } from 'react';
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
        setPlayer1Ready,
        setPlayer2Ready,
        game,
        gameId,
        setGame,
        motion,
        setMotion,
        setTimer,
        setMove,
        setWinner,
        setGameId,
        setEnemyBoard,
        setMyBoard,
        enemyId,
        setEnemyId,
        myBoard,
    } = gameState((state) => state);
    const { username, id: userId } = userStore((state) => state);
    const {
        ready,
        setReady,
        setSquares,
        setFleet,
        checkAllShipPlaced,
        setSquaresBoard2,
    } = useStore((state) => state);
    const fetchRef = useRef(null);

    const state = {
        player1Ready,
        player2Ready,
        userId,
        gameId,
    };
    function RematchStateUpdate() {
        setWinner(null);
        setEnemyBoard(CLEAR_BOARD);
        setSquaresBoard2(CLEAR_BOARD);
        setPlayer1Ready(false);
        setPlayer2Ready(false);
        setMyBoard(null);
        setGame(false);
        setMotion(null);
        setTimer(0);
        setGameId(null);
        setReady();
        setSquares(CLEAR_BOARD);
        setFleet([...FLEET]);
        checkAllShipPlaced();
    }
    function gameReset() {
        setGame(false);
        setMotion(null);
        setTimer(0);
        setGameId(null);
        setReady(false);
        setEnemyBoard(CLEAR_BOARD);
        setSquaresBoard2(CLEAR_BOARD);
        setPlayer1Ready(false);
        setPlayer2Ready(false);
        setSquares(myBoard);
        checkAllShipPlaced();
    }
    useEffect(() => {
        function handleReceivingState(state) {
            if (username === roomId) {
                setPlayer2Ready(state.player2Ready);
                setEnemyId(state.userId);
                setGameId(gameId || state.gameId);
            } else {
                setEnemyId(state.userId);
                setPlayer1Ready(state.player1Ready);
                setGameId(gameId || state.gameId);
            }
            console.log(gameId);
        }
        function handleSetWinner({ winnerName }) {
            setWinner(winnerName);
            setMotion(null);
            setTimer(0);
            setGame(false);
            socket.emit('updateUserData');
            deleteLocalStorageReconnectData();
        }

        function handleSetMotion(user) {
            if (!motion) {
                setMotion(user);
            }
        }
        function handeSetTimer(time) {
            setTimer(time);
            if (username === motion) {
                setMove(true);
            } else {
                setMove(false);
            }
            setLocalStorageRoomId(roomId);
        }
        function handleChangeMotion(motion) {
            if (motion === player1) {
                setMotion(player2);
            } else {
                setMotion(player1);
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
                    socket.emit('setMotion', [player1, player2]);
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
            socket.on('setMotion', handleSetMotion);
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
            socket.off('setMotion', handleSetMotion);
        };
    }, [
        roomId,
        player1Ready,
        player2Ready,
        game,
        motion,
        ready,
        gameId,
        enemyId,
    ]);
}
