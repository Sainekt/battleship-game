'use client';
import Link from 'next/link';
import { removeCookieToken } from '../security/token';
import { useState, useEffect } from 'react';
import { userStore, gameState } from '../context/Context';
import FindGame from './FindGame';
import Profile from './Profile';
import { HEADERS } from '../utils/constants';
import { socket } from '../components/Room';

export default function NavBar() {
    const {
        setId,
        username,
        setUsername,
        setEmail,
        games,
        setGames,
        victories,
        setVictories,
        avg,
        setAvg,
    } = userStore((state) => state);
    const { game } = gameState((state) => state);

    const [findgame, setFindgame] = useState(false);
    const [profile, setProfile] = useState(false);

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
                        setEmail(data.email);
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
    function handleProfile() {
        setProfile(!profile);
    }
    function handleLogOut() {
        removeCookieToken();
        socket.disconnect();
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
                    <button
                        className='button-nav'
                        onClick={handleFindGame}
                        disabled={username && !game ? false : true}
                    >
                        Find game
                    </button>
                    <button
                        className='button-nav'
                        onClick={handleProfile}
                        disabled={username ? false : true}
                    >
                        Profile
                    </button>
                </div>
                <Link
                    className='logout-btn'
                    onClick={handleLogOut}
                    href={'/signin'}
                >
                    Log Out
                </Link>
            </nav>
            {findgame ? (
                <FindGame handleSetModal={handleFindGame}></FindGame>
            ) : null}
            {profile ? (
                <Profile handleSetModal={handleProfile}></Profile>
            ) : null}
        </>
    );
}
