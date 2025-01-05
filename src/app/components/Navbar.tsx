'use client';
import Link from 'next/link';
import { removeCookieToken, getUsername } from '../security/token';
import { getStats } from '../db/connection';
import { useState, useEffect } from 'react';
import { userStore } from '../context/Context';

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

    return (
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
                <button className='button-nav'>Find game</button>
                <button className='button-nav'>Profile</button>
            </div>
            <Link
                className='logoutButton'
                onClick={() => removeCookieToken()}
                href={'/signin'}
            >
                Log Out
            </Link>
        </nav>
    );
}
