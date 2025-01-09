'use client';
import Square from './Square';
import { useState, useEffect } from 'react';
import { getStyle, markerMiss, validatePlace } from '../utils/utils';
import { gameState, userStore, useStore } from '../context/Context';
import { socket } from './Room';
import { CHAR_LIST } from '../utils/constants';

function getBoard(squares, disabled = false, handleClick, start = false) {
    const rows = [];
    for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
        const row = [];
        for (let colIndex = 0; colIndex < 10; colIndex++) {
            const index = rowIndex * 10 + colIndex;
            const styleClass = getStyle(start, disabled, squares[index]);

            row.push(
                <Square
                    key={index}
                    value={index}
                    disabled={disabled}
                    onSquareClick={handleClick}
                    className={styleClass}
                    text={squares[index]}
                />
            );
        }
        rows.push(
            <div key={rowIndex} className='board-row'>
                {row}
            </div>
        );
    }
    return rows;
}

export default function Board() {
    const {
        squares,
        setSquares,
        ready,
        fleet1: fleet,
        ship,
        sizeDecrement,
        direction,
        setDirection,
    } = useStore((state) => state);
    const [squares2, setSquares2] = useState(Array(100).fill(null));
    const { checkGame, boardPlayer1, boardPlayer2, roomId, game } = gameState(
        (state) => state
    );
    const { username } = userStore((state) => state);

    useEffect(() => {
        function handleShot(shot) {
            let board;
            if (!roomId) {
                return;
            }
            if (squares[shot] === '•' || squares[shot] === 'X') {
                return;
            }
            if (roomId === username) {
                board = boardPlayer1;
            } else {
                board = boardPlayer2;
            }
            let marker = '•';
            if (squares[shot]) {
                marker = 'X';
            }

            const newValues = [...squares];

            newValues[shot] = marker;
            const destroyShips = checkGame(board, newValues);
            if (destroyShips.length) {
                const markerMissSquares = markerMiss(destroyShips);
                for (const i of markerMissSquares) {
                    if (!newValues[i]) {
                        newValues[i] = '•';
                    }
                }
            }
            console.log(newValues);

            setSquares(newValues);
        }

        socket.on('shot', handleShot);
        return () => socket.off('shot', handleShot);
    }, [boardPlayer1, boardPlayer2, squares]);

    function handleClickBorad1(event) {
        const index = +event.target.value;
        const selectShip = fleet.find((el) => el.id === +ship);
        if (!selectShip) {
            return;
        }
        const value = selectShip.type[selectShip.quantity - 1];

        if (
            !squares[index] &&
            validatePlace(
                index,
                value,
                selectShip,
                squares,
                direction,
                setDirection
            ) &&
            sizeDecrement()
        ) {
            const newValues = [...squares];
            newValues[index] = value;
            setSquares(newValues);
        }
    }
    function handleClickBorad2(event) {
        const index = +event.target.value;
        let board;
        if (!roomId) {
            return;
        }
        if (roomId === username) {
            board = boardPlayer2;
        } else {
            board = boardPlayer1;
        }
        if (squares2[index] === '•' || squares2[index] === 'X') {
            return;
        }
        let marker = '•';
        if (board[index]) {
            marker = 'X';
        }
        socket.emit('shot', index);
        setSquares2((values) => {
            const newValues = [...values];
            newValues[index] = marker;

            const destroyShips = checkGame(board, newValues);
            if (destroyShips.length) {
                const markerMissSquares = markerMiss(destroyShips);
                for (const i of markerMissSquares) {
                    if (!newValues[i]) {
                        newValues[i] = '•';
                    }
                }
            }
            return newValues;
        });
    }

    const board = getBoard(squares, false, handleClickBorad1);
    const board2 = getBoard(squares2, !game, handleClickBorad2);

    return (
        <div className='board-container'>
            <div className='board'>
                <div className='board-header'>
                    <div className='board-header-cell'></div>
                    {CHAR_LIST.map((char, index) => (
                        <div key={index} className='board-header-cell'>
                            {char}
                        </div>
                    ))}
                </div>
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className='board-row'>
                        <div className='board-header-cell'>{rowIndex + 1}</div>
                        {row}
                    </div>
                ))}
            </div>
            <div className='board'>
                <div className='board-header'>
                    <div className='board-header-cell'></div>
                    {CHAR_LIST.map((char, index) => (
                        <div key={index} className='board-header-cell'>
                            {char}
                        </div>
                    ))}
                </div>
                {board2.map((row, rowIndex) => (
                    <div key={rowIndex} className='board-row'>
                        <div className='board-header-cell'>{rowIndex + 1}</div>
                        {row}
                    </div>
                ))}
            </div>
        </div>
    );
}
