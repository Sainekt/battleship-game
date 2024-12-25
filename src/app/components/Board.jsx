'use client';
import Square from './Square';
import { useState } from 'react';
import useStore from '../context/Context';

const CHAR_LIST = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];

function getBoard(
    squares,
    disabled = false,
    handleClick,
    className = 'square',
    ship = false
) {
    const rows = [];
    for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
        const row = [];
        for (let colIndex = 0; colIndex < 10; colIndex++) {
            const index = rowIndex * 10 + colIndex;
            row.push(
                <Square
                    key={index}
                    value={index}
                    disabled={disabled}
                    onSquareClick={handleClick}
                    className={
                        squares[index] ? `${className} square-panel` : className
                    }
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
    const [squares, setSquares] = useState(Array(100).fill(null));
    const [squares2, setSquares2] = useState(Array(100).fill(null));
    const [squareDisabled, setSquareDisabled] = useState(true);
    const fleet = useStore((state) => state.fleet1);
    const ship = useStore((state) => state.ship);
    const sizeDecrement = useStore((state) => state.sizeDecrement);
    const reset = useStore((state) => state.reset);

    function validatePlace(i) {
        const indexes = [
            i - 11 > 0 ? i - 11 : 0,
            i - 10 > 0 ? i - 10 : 0,
            i - 9 > 0 ? i - 9 : 0,
            i - 1 > 0 ? i - 1 : 0,
            i + 1 < 100 ? i + 1 : i,
            i + 9 < 100 ? i + 9 : i,
            i + 10 < 100 ? i + 10 : i,
            i + 11 < 100 ? i + 11 : i,
        ];
        
        for (const i of indexes) {
            if (squares[i] !== null && squares[i] !== ship) {
                return false;
            }
        }

        return true;
    }

    function handleClickBorad1(event) {
        const index = +event.target.value;

        if (
            ship &&
            !squares[index] &&
            validatePlace(index) &&
            sizeDecrement()
        ) {
            setSquares((values) => {
                const newValues = [...values];
                newValues[index] = ship;
                return newValues;
            });
        }
    }
    function handleReset() {
        setSquares(Array(100).fill(null));
        reset();
    }
    function handleClickBorad2(i) {
        setSquares2((values) => {
            const newValues = [...values];
            newValues[i] = 'X';
            return newValues;
        });
    }

    const board = getBoard(squares, false, handleClickBorad1, 'square', ship);
    const board2 = getBoard(
        squares2,
        squareDisabled,
        handleClickBorad2,
        'square-disabled square'
    );

    return (
        <div className='board-container'>
            <button onClick={handleReset}>RESET</button>
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
