'use client';
import { removeCookieToken } from '../security/token';
import { useState, useEffect } from 'react';
import { userStore, gameState } from '../context/Context';
import FindGame from './FindGame';
import Profile from './Profile';
import { HEADERS } from '../utils/constants';
import { socket } from '../components/Room';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();
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
        router.push('/signin');
    }

    return (
        <>
            <nav className='bg-gray-100 mx-auto flex p-4 justify-between items-center'>
                <div className='flex items-center text-center bg-blue-100 border-2 border-blue-300 rounded-lg p-2'>
                    <div className='flex-row'>
                        <span className='font-bold'>
                            {username ? username : 'loading...'}
                        </span>
                        <br />
                        <span className='font-bold'>Games:</span> {games.length}
                        <br />
                    </div>
                    <div className='ml-2'>
                        <span className='font-bold'>Victories:</span>{' '}
                        {victories}
                        <br />
                        <span className='font-bold'>W/L:</span> {avg}
                    </div>
                </div>

                <div className='flex-grow flex justify-center mx-4'>
                    <button
                        className='bg-blue-500 text-white font-bold px-4 rounded-l-full w-26 h-12 border-r-2 border-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:border-gray-400'
                        onClick={handleFindGame}
                        disabled={username && !game ? false : true}
                    >
                        Find game
                    </button>
                    <button
                        className='bg-blue-500 text-white font-bold px-4 rounded-r-full w-28 hover:bg-blue-700 disabled:bg-gray-300'
                        onClick={handleProfile}
                        disabled={username ? false : true}
                    >
                        Profile
                    </button>
                </div>
                <div className='justify-end'>
                    <button
                        onClick={handleLogOut}
                        className='  bg-red-500 text-white font-bold px-4 rounded-full w-28 h-12 hover:bg-red-700'
                    >
                        Log out
                    </button>
                </div>
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
