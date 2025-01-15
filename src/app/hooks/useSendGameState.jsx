'use client';

import { useEffect } from 'react';
import { gameState, userStore, useStore } from '../context/Context';
import { socket } from '../components/Room';
import { TIME_FOR_MOTION } from '../utils/constants';

export default function useSendGameState() {
    const {
        roomId,
        player1Ready,
        player2Ready,
        player1,
        player2,
        winner,
        boardPlayer1,
        boardPlayer2,
        setPlayer1Ready,
        setPlayer2Ready,
        setBoardPlayer1,
        setBoardPlayer2,
        game,
        setGame,
        motion,
        setMotion,
        setTimer,
        timer,
    } = gameState((state) => state);
    const { username } = userStore((state) => state);
    const { ready, setReady } = useStore((state) => state);

    const state = {
        roomId,
        player1Ready,
        player2Ready,
        player1,
        player2,
        winner,
        boardPlayer1,
        boardPlayer2,
        username,
        game,
        motion,
        timer,
    };
    useEffect(() => {
        function handleReceivingState(state) {
            if (username === roomId) {
                setPlayer2Ready(state.player2Ready);
                setBoardPlayer2(state.boardPlayer2);
            } else {
                setPlayer1Ready(state.player1Ready);
                setBoardPlayer1(state.boardPlayer1);
            }
        }

        function handleSetMotion(user) {
            if (!motion) {
                setMotion(user);
            }
        }
        function handeSetTimer(time) {
            setTimer(time);
        }
        function handleChangeMotion(motion) {
            if (motion === player1) {
                setMotion(player2);
            } else {
                setMotion(player1);
            }
            socket.emit('setTimer', TIME_FOR_MOTION);
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

        return () => {
            socket.off('changeMotion', handleChangeMotion);
            socket.off('setTimer', handeSetTimer);
            socket.off('sendState', handleReceivingState);
            socket.off('setMotion', handleSetMotion);
        };
    }, [roomId, player1Ready, player2Ready, winner, game, motion]);

    useEffect(() => {
        function checkStart(check) {
            if (ready && check) {
                setGame(true);
                if (username === roomId) {
                    socket.emit('setMotion', [player1, player2]);
                }
            } else {
                setGame(false);
            }
        }
        socket.on('checkStart', checkStart);

        return () => {
            socket.off('checkStart', checkStart);
        };
    }, [ready]);
}
