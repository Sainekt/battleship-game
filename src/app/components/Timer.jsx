'use client';
import { useEffect, useState, useRef } from 'react';
import { gameState } from '../context/Context';

export default function Timer() {
    const [time, setTime] = useState(null);
    const { player1Ready, player2Ready, setGame, game } = gameState(
        (state) => state
    );
    const timOutId = useRef(null);

    useEffect(() => {
        if (game) {
            return;
        }
        if (player1Ready && player2Ready && time === null) {
            setTime(3);
        }

        if (time > 0) {
            timOutId.current = setTimeout(() => {
                setTime((prev) => {
                    if (prev === 1) {
                        handleStartGame();
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        if (!player1Ready || !player2Ready) {
            setTime(null);
            clearTimeout(timOutId.current);
        }

        return () => {
            clearTimeout(timOutId.current);
        };
    }, [player1Ready, player2Ready, time, game]);

    const handleStartGame = () => {
        setTimeout(() => {
            setGame(true);
            clearTimeout(timOutId.current);
        }, 0);
    };

    return (
        <div>{time && !game ? 'The game will start in: ' + time : null}</div>
    );
}
