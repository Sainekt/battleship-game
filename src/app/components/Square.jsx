'use client';
import classNames from 'classnames';
import Image from 'next/image';
import fire from '../../../public/fire.gif';
import explosion from '../../../public/explosion.gif';
import { useEffect, useState } from 'react';

export default function Square({ value, disabled, onSquareClick, text }) {
    const [gif, setGif] = useState(explosion);
    useEffect(() => {
        let timeOut;
        if (text === 'X') {
            if (timeOut) clearTimeout(timeOut);
            timeOut = setTimeout(() => setGif(fire), 500);
        }
        return () => clearTimeout(timeOut);
    }, [text]);
    return (
        <button
            className={classNames(
                `border border-opacity-50 border-indigo-600 text-2xl h-[34px] w-[34px] text-center font-bold
                disabled:bg-gray-400 disabled:border-gray-200`,
                {
                    'bg-blue-500': text && text !== '•',
                    'bg-gray-900': text === 'X',
                }
            )}
            disabled={disabled}
            onClick={onSquareClick}
            value={value}
        >
            <span hidden={text === 'X' || text === '•' ? false : true}>
                {text === 'X' ? (
                    <Image
                        src={gif}
                        alt='fire'
                        width='34'
                        height='34'
                        unoptimized={true}
                    />
                ) : (
                    text
                )}
            </span>
        </button>
    );
}
