'use client';
import Link from 'next/link';
import { removeCookieToken, getUsername } from '../security/token';
import { getStats } from '../db/connection';
import { useState, useEffect } from 'react';
import { userStore } from '../context/Context';
import FindGame from './FindGame';

export default function NavBar() {
    const {
        username,
        setUsername,
        games,
        setGames,
        victories,
        setVictories,
        avg,
        setAvg,
    } = userStore((state) => state);
    const [findgame, setFindgame] = useState(false);

    useEffect(() => {
        getUsername()
            .then((username) => {
                setUsername(username);
                getStats(username)
                    .then((value) => {
                        setGames(value.countGames);
                        setVictories(value.victories);
                        setAvg(value.avg);
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
    }, []);

    function handleFindGame() {
        setFindgame(!findgame);
    }

    return (
        <>
            <nav className='navbar'>
                <div className='userInfo'>
                    {username}
                    <br />
                    Games: {games}
                </div>
                <div className='userInfo'>
                    Victories: {victories}
                    <br />
                    W/L: {avg}
                </div>
                <div className='navButtons'>
                    <button className='button-nav' onClick={handleFindGame}>
                        Find game
                    </button>
                    <button className='button-nav'>Profile</button>
                </div>
                <Link
                    className='logout-btn'
                    onClick={() => removeCookieToken()}
                    href={'/signin'}
                >
                    Log Out
                </Link>
            </nav>
            {findgame ? (
                <FindGame handleSetModal={handleFindGame}></FindGame>
            ) : null}
        </>
    );
}
