'use client';
import { useEffect, useRef, useState } from 'react';
import { gameState, useStore, userStore } from '../context/Context';
import { socket } from './Room';

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
            setTimer(5);
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

        return () => {
            clearTimeout(timeOutRef.current);
        };
    }, [player1Ready, player2Ready, game, timer]);

    const handleStartGame = () => {
        clearTimeout(timeOutRef.current);
        socket.emit('checkStart', true);
    };

    // move timer
    useEffect(() => {
        if (!game) return;
        setText(`Player's turn: ${motion}`);
        if (timer) {
            timeOutRef.current = setTimeout(() => {
                setTimer(timer - 1);
                if (timer - 1 === 0) {
                    setMotion(player1 === motion ? player2 : player1);
                }
            }, 1000);
        }

        return () => clearTimeout(timeOutRef.current);
    }, [motion, timer]);

    return (
        <h3>
            {timer && !game ? `${text} ${timer}` : null}
            {timer && game ? `${text} ${timer}` : null}
        </h3>
    );
}
