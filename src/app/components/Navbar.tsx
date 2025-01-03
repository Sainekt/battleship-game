'use client';
import Link from 'next/link';
import { removeCookieToken } from '../security/token';
import { useState, useEffect } from 'react';

export default function NavBar() {
    const [username, setUsername] = useState(null);

    useEffect(() => {
      
      
    }, []);

    return (
        <nav className='navbar'>
            <div className='userInfo'>
                {username}
                <br />
                Games: 0
            </div>
            <div className='userInfo'>
                Victories: <br />
                W/L: 0
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
