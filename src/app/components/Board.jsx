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
                    className={className}
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

    function addShip(event) {
        event.target.classList.add('square-panel')
        
    }

    function handleClickBorad1(event) {
        const index = +event.target.value
        
        if (ship) {
            return addShip(event);
        }
        setSquares((values) => {
            const newValues = [...values];
            newValues[index] = 'x';            
            return newValues;
        });
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
