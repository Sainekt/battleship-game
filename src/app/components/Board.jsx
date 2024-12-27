'use client';
import Square from './Square';
import { useState } from 'react';
import useStore from '../context/Context';
import { getStyle, markerMiss, validatePlace } from '../utils/utils';
import { gameState } from '../context/Context';

const CHAR_LIST = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];

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
    const { checkGame, boardPlayer1 } = gameState((state) => state);

    function handleClickBorad1(event) {
        const index = +event.target.value;
        const selectShip = fleet.find((el) => el.id === +ship);
        if (!selectShip) {
            return;
        }
        const value = selectShip.type[selectShip.quantity - 1];

        if (
            !squares[index] &&
            validatePlace(index, value, selectShip,squares, direction, setDirection) &&
            sizeDecrement()
        ) {
            const newValues = [...squares];
            newValues[index] = value;
            setSquares(newValues);
        }
    }
    function handleClickBorad2(event) {
        const index = +event.target.value;
        if (!boardPlayer1) {
            return;
        }
        let marker = '•';
        if (boardPlayer1[index]) {
            marker = 'X';
        }
        setSquares2((values) => {
            const nevValuse = [...values];
            nevValuse[index] = marker;
            const destroyShips = checkGame(nevValuse);
            if (destroyShips.length) {
                const markerMissSquares = markerMiss(destroyShips);
                for (const i of markerMissSquares) {
                    if (!nevValuse[i]) {
                        nevValuse[i] = '•';
                    }
                }
            }
            return nevValuse;
        });
    }

    const board = getBoard(squares, false, handleClickBorad1);
    const board2 = getBoard(squares2, !ready, handleClickBorad2);

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
