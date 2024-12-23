'use client';
import Square from './Square';
import { useState } from 'react';

export default function Board() {
    const [squares, setSquares] = useState(Array(100).fill(null));

    const rows = [];
    for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
        const row = [];
        for (let colIndex = 0; colIndex < 10; colIndex++) {
            const index = rowIndex * 10 + colIndex;
            row.push(
                <Square key={index} value={squares[index]} />
            );
        }
        rows.push(
            <div key={rowIndex} className='board-row'>
                {row}
            </div>
        );
    }

    return (
        <div className='board'>
            {rows}
        </div>
    );
}