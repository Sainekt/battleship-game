'use client';
import { useEffect, useRef, useState } from 'react';
import { gameState, useStore, userStore } from '../context/Context';
import { socket } from './Room';

export default function Timer() {
    const { time, setTime } = useStore((state) => state);
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
    } = gameState((state) => state);
    const { username } = userStore((state) => state);

    const timOutId = useRef(null);

    useEffect(() => {
        if (game) {
            return;
        }
        if (player1Ready && player2Ready && time === null) {
            setTime(1);
            setText('The game will start in: ');
        }

        if (time > 0) {
            timOutId.current = setTimeout(() => {
                setTime(time - 1);
                if (time - 1 === 0) {
                    handleStartGame();
                }
            }, 1000);
        }

        if (!player1Ready || !player2Ready) {
            setTime(null);
            clearTimeout(timOutId.current);
            socket.emit('checkStart', false);
        }

        return () => {
            clearTimeout(timOutId.current);
        };
    }, [player1Ready, player2Ready, time, game]);

    const handleStartGame = () => {
        clearTimeout(timOutId.current);
        setTime(0);
        socket.emit('checkStart', true);
    };

    // move timer
    useEffect(() => {
        if (!game) return;
        setText(`Player's turn: ${motion}`);
        if (!time) {
            setTime(15);
        }
        timOutId.current = setTimeout(() => {
            console.log(time);
            setTime(time - 1);
            if (time - 1 === 0) {
                setMotion(player1 === motion ? player2 : player1);
            }
        }, 1000);

        return () => clearTimeout(timOutId.current);
    }, [motion, time]);

    return (
        <h3>
            {time && !game ? `${text} ${time}` : null}
            {time && game ? `${text} ${time}` : null}
        </h3>
    );
}
