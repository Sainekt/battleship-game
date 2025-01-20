'use client';
import Link from 'next/link';
import { removeCookieToken, getToken } from '../security/token';
import { useState, useEffect } from 'react';
import { userStore } from '../context/Context';
import FindGame from './FindGame';
import { HEADERS } from '../utils/constants';

export default function NavBar() {
    const {
        id,
        setId,
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
        const domain = `${location.protocol}//${location.host}`;

        getToken().then(([prefix, token]) => {
            const headers = { ...HEADERS, Authorization: `${prefix} ${token}` };
            fetch(`${domain}/api/users/me`, {
                method: 'GET',
                headers: headers,
            }).then((response) => {
                if (response.ok) {
                    response.json().then((data) => {
                        setId(data.id);
                        setUsername(data.username);
                        setGames(data.games.length);
                        setVictories(data.victories);
                        setAvg(data.avg);
                    });
                }
            });
        });
    }, [games]);

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
