'use client';
import Square from './Square';
import { useState } from 'react';

const CHAR_LIST = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];

function getBoard(squares, disabled = false, handleClick) {
    const rows = [];
    for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
        const row = [];
        for (let colIndex = 0; colIndex < 10; colIndex++) {
            const index = rowIndex * 10 + colIndex;
            row.push(
                <Square
                    key={index}
                    value={squares[index]}
                    disabled={disabled}
                    onSquareClick={() => handleClick(index)}
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

    function handleClickBorad1(i) {
        setSquares(values => {
            const newValues = [...values];
            newValues[i] = 'X'
            return newValues
        })
    }
    function handleClickBorad2(i) {
        setSquares2(values => {
            const newValues = [...values];
            newValues[i] = 'X'
            return newValues
        })
    }

    const rows = getBoard(squares, false, handleClickBorad1);
    const rows2 = getBoard(squares2, squareDisabled, handleClickBorad2);

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
                {rows.map((row, rowIndex) => (
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
                {rows2.map((row, rowIndex) => (
                    <div key={rowIndex} className='board-row'>
                        <div className='board-header-cell'>{rowIndex + 1}</div>
                        {row}
                    </div>
                ))}
            </div>
        </div>
    );
}
