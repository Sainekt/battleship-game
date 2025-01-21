'use client';
import Link from 'next/link';
import { removeCookieToken } from '../security/token';
import { useState, useEffect } from 'react';
import { userStore } from '../context/Context';
import FindGame from './FindGame';
import { HEADERS } from '../utils/constants';
import { socket } from '../components/Room';

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
        function setUserData() {
            const domain = `${location.protocol}//${location.host}`;
            fetch(`${domain}/api/users/me`, {
                method: 'GET',
                headers: HEADERS,
            }).then((response) => {
                if (response.ok) {
                    response.json().then((data) => {
                        setId(data.id);
                        setUsername(data.username);
                        setGames(data.games);
                        setVictories(data.victories);
                        setAvg(data.avg);
                    });
                }
            });
        }
        setUserData();
        socket.on('updateUserData', setUserData);
        return () => {
            socket.off('updateUserData', setUserData);
        };
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
                    Games: {games.length}
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
