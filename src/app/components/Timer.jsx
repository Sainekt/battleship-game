'use client';
import { useEffect, useState, useRef } from 'react';
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
        timer,
        setTimer,
        setMove,
        winner,
        stop,
    } = gameState((state) => state);
    const { username } = userStore((state) => state);
    const timeOutStart = useRef(null);
    const timeOutGame = useRef(null);

    useEffect(() => {
        if (game || winner) {
            clearTimeout(timeOutStart.current);
            return;
        }

        if (player1Ready && player2Ready && timer === 0) {
            setTimer(TIME_FOR_START);
            setText('The game will start in: ');
        }

        if (timer > 0) {
            timeOutStart.current = setTimeout(() => {
                setTimer(timer - 1);
                if (timer - 1 === 0) {
                    handleStartGame();
                }
            }, 1000);
        }

        if (!player1Ready || !player2Ready) {
            setTimer(0);
            clearTimeout(timeOutStart.current);
            socket.emit('checkStart', false);
        }

        function handleStartGame() {
            if (game) {
                return;
            }
            clearTimeout(timeOutStart.current);
            socket.emit('checkStart', true);
        }

        return () => {
            clearTimeout(timeOutStart.current);
        };
    }, [player1Ready, player2Ready, game, timer, motion]);

    // move timer
    useEffect(() => {
        if (!game || !motion || winner || stop) {
            clearTimeout(timeOutGame.current);
            return;
        }
        username === motion && timer > 0
            ? setText(`Yours move: `)
            : setText(`Player's turn: ${motion}`);
        if (timer <= 0) {
            setText('turn change...');
        }

        timeOutGame.current = setTimeout(() => {
            setTimer(timer - 1);
            if (!timer) {
                setMove(false);
                if (username === roomId) {
                    setTimeout(() => {
                        socket.emit('changeMotion', motion);
                    }, 2000);
                }
            }
        }, 1000);

        return () => {
            clearTimeout(timeOutGame.current);
        };
    }, [motion, timer, game, winner, stop]);

    function getText() {
        if (winner) {
            return winner === username ? "You've won" : "You've lost";
        }
        if (timer > 0 && !game) {
            return `${text} ${timer}`;
        } else if (timer > 0 && game) {
            return `${text} ${timer}`;
        } else if (timer <= 0 && game) {
            return text;
        }
        return null;
    }

    return <h3>{getText()}</h3>;
}
