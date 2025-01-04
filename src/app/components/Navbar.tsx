'use client';
import Link from 'next/link';
import { removeCookieToken, getUsername } from '../security/token';
import { getStats } from '../db/connection';
import { useState, useEffect } from 'react';

export default function NavBar() {
    const [username, setUsername] = useState(null);
    const [games, setGames] = useState(null);
    const [victories, setVictories] = useState(null);
    const [avg, setAvg] = useState(null);

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
