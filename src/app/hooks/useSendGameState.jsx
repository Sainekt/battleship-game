'use client';

import { useEffect, useState, useRef } from 'react';
import { gameState, userStore, useStore } from '../context/Context';
import { socket } from '../components/Room';
import { TIME_FOR_MOTION, HEADERS, FLEET } from '../utils/constants';

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
        setRematch,
        setEnemyBoard,
        setMyBoard,
    } = gameState((state) => state);
    const { username, id: userId } = userStore((state) => state);
    const [enemyId, setEnemyId] = useState(null);
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
        const squares = Array(100).fill(null);
        setWinner(null);
        setEnemyBoard(squares);
        setSquaresBoard2(squares);
        setPlayer1Ready(false);
        setPlayer2Ready(false);
        setMyBoard(null);
        setGame(false);
        setMotion(null);
        setTimer(0);
        setGameId(null);
        setReady();
        setSquares(squares);
        setRematch(false);
        setFleet([...FLEET]);
        checkAllShipPlaced();
    }
    useEffect(() => {
        const domain = `${location.protocol}//${location.host}`;

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
        function handleSetWinner(winner) {
            if (roomId === username && gameId && !fetchRef.current) {
                const winnerId = winner === username ? userId : enemyId;
                const body = {
                    winner: winnerId,
                    status: 'finished',
                    score: 90,
                };
                fetchRef.current = fetch(`${domain}/api/games/${gameId}`, {
                    method: 'PATCH',
                    body: JSON.stringify(body),
                }).catch((err) => {
                    console.error(err);
                });
                socket.emit('updateUserData');
            }
            setWinner(winner);
            setMotion(null);
            setTimer(0);
            setGame(false);
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
            let timeOut;
            if (ready && check) {
                setGame(true);
                setTimer(0);
                if (username === roomId) {
                    socket.emit('setMotion', [player1, player2]);
                    timeOut = setTimeout(() => {
                        fetch(`${domain}/api/games`, {
                            method: 'POST',
                            headers: HEADERS,
                            body: JSON.stringify({
                                player_1: player1,
                                player_2: player2,
                            }),
                        })
                            .then((response) => {
                                if (response.status !== 201) {
                                    throw new Error('Game not created');
                                }
                                return response.json();
                            })
                            .then((value) => {
                                setGameId(value.gameId);
                            })
                            .catch((err) => {
                                console.log(err);
                                socket.emit('checkStart', false);
                            });
                    }, 10000);
                }
            } else {
                setGame(false);
                clearTimeout(timeOut);
            }
        }
        function handleRematch() {
            setRematch(true);
        }
        function accetRematch() {
            setRematch(false);
            RematchStateUpdate();
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
        socket.on('rematch', handleRematch);
        socket.on('acceptRematch', accetRematch);

        return () => {
            socket.off('acceptRematch', accetRematch);
            socket.off('rematch', handleRematch);
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
