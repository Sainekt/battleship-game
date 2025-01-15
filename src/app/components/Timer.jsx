'use client';
import { useEffect, useRef, useState } from 'react';
import { gameState, useStore, userStore } from '../context/Context';
import { socket } from './Room';
import { TIME_FOR_START, TIME_FOR_MOTION } from '../utils/constants';

export default function Timer() {
    const [text, setText] = useState(null);
    const {
        player1Ready,
        player2Ready,
        game,
        roomId,
        motion,
        setMotion,
        player1,
        player2,
        timer,
        setTimer,
    } = gameState((state) => state);
    const { username } = userStore((state) => state);

    const timeOutRef = useRef(null);

    useEffect(() => {
        if (game) {
            return;
        }
        if (player1Ready && player2Ready && timer === 0) {
            setTimer(TIME_FOR_START);
            setText('The game will start in: ');
        }

        if (timer > 0) {
            timeOutRef.current = setTimeout(() => {
                setTimer(timer - 1);
                if (timer - 1 === 0) {
                    handleStartGame();
                }
            }, 1000);
        }

        if (!player1Ready || !player2Ready) {
            setTimer(0);
            clearTimeout(timeOutRef.current);
            socket.emit('checkStart', false);
        }

        function handleStartGame() {
            clearTimeout(timeOutRef.current);
            socket.emit('checkStart', true);
        }

        return () => {
            clearTimeout(timeOutRef.current);
        };
    }, [player1Ready, player2Ready, game, timer]);

    // move timer
    useEffect(() => {
        if (!game) return;
        username === motion
            ? setText(`Yours move: `)
            : setText(`Player's turn: ${motion}`);
        if (timer) {
            timeOutRef.current = setTimeout(() => {
                setTimer(timer - 1);
                if (timer - 1 === 0) {
                    if (username === roomId) {
                        setTimeout(() => {
                            socket.emit('changeMotion', motion);
                        }, 2000);
                    }
                }
            }, 1000);
        }

        return () => clearTimeout(timeOutRef.current);
    }, [motion, timer]);

    return (
        <h3>
            {timer && !game ? `${text} ${timer}` : null}
            {timer && game ? `${text} ${timer}` : null}
            {!timer && game ? 'turn change...' : null}
        </h3>
    );
}
