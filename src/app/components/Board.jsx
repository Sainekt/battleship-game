'use client';
import Square from './Square';
import { useState } from 'react';
import useStore from '../context/Context';
import { validCoord } from '../utils/coordinate';

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
    const [direction, setDirection] = useState(null);

    function validatePlace(i, value, selectShip) {
        const shipCheck = validCoord[i]
            ? validCoord[i]
            : [i - 11, i - 10, i - 9, i - 1, i + 1, i + 9, i + 10, i + 11];

        for (const index of shipCheck) {
            if (squares[index] && squares[index] !== value) {
                return false;
            }
        }
        const allow = [i - 1, i + 1, i - 10, i + 10];
        if (selectShip.size === selectShip.id) {
            return true;
        }

        for (const index of allow) {
            if (!direction && squares[index] === value) {
                if (i - index === 10 || i - index === -10) {
                    setDirection('v');
                } else if (i - index === 1 || i - index === -1) {
                    setDirection('h');
                }
                return true;
            }
        }
        console.log(direction);

        return false;
    }

    function handleClickBorad1(event) {
        const index = +event.target.value;
        const selectShip = fleet.find((el) => el.id === +ship);
        if (!selectShip) {
            return;
        }
        const value = selectShip.type[selectShip.quantity - 1];

        if (
            !squares[index] &&
            validatePlace(index, value, selectShip) &&
            sizeDecrement()
        ) {
            setSquares((values) => {
                const newValues = [...values];
                newValues[index] = value;
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
