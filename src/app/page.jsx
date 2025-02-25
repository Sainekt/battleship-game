'use client';
import Board from './components/Board';
import Panel from './components/Panel';
import NavBar from './components/Navbar';
import Timer from './components/Timer';
import Createroom from './components/Room';
import './globals.css';
import { useState, useLayoutEffect } from 'react';

export default function Home() {
    const [winWidth, setWinWidth] = useState(1024);
    useLayoutEffect(() => {
        if (typeof window !== 'undefined') {
            setWinWidth(window.innerWidth);
            function handleResize() {
                setWinWidth(window.innerWidth);
            }
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    return (
        <>
            <NavBar winWidth={winWidth} />
            <div className='lg:flex'>
                <div>
                    {winWidth >= 1024 ? <Panel></Panel> : null}
                    <Createroom></Createroom>
                </div>
                <div>
                    {winWidth < 1024 ? <Panel></Panel> : null}
                    <Timer></Timer>
                    <Board></Board>
                </div>
            </div>
        </>
    );
}
