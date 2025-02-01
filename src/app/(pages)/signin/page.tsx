'use client';
import { useState } from 'react';
import Link from 'next/link';
import { setCookieToken } from '../../security/token';
import { useRouter } from 'next/navigation';
import { socket } from '../../components/Room';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [usernameErr, setUsernameErr] = useState(null);
    const [passwordErr, setPasswordErr] = useState(null);
    const router = useRouter();

    async function handleClick(event) {
        event.preventDefault();
        const body = { username: username, password: password };
        const domain = `${location.protocol}//${location.host}`;
        const response = await fetch(`${domain}/api/signin`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (response.status === 201) {
            await setCookieToken(data.token);
            socket.connect();
            router.push('/');
        }
        setError(data.error);
        if (response.status >= 400) {
            setUsernameErr(data.username);
            setPasswordErr(data.password);
        }
    }

    return (
        <div className='container'>
            <form method='POST'>
                <div>
                    <label htmlFor='username'>Enter your username:</label>
                    <br />
                    <input
                        type='text'
                        name='username'
                        id='username'
                        required
                        placeholder='username'
                        value={username}
                        onChange={(e) => {
                            setUsernameErr(null);
                            setUsername(e.target.value);
                            setError(null);
                        }}
                    />
                    {usernameErr ? (
                        <p style={{ color: 'red' }}>{usernameErr}</p>
                    ) : (
                        <p></p>
                    )}
                </div>
                <div>
                    <label htmlFor='password'>Enter your password:</label>
                    <br />
                    <input
                        type='password'
                        name='password'
                        id='password'
                        required
                        placeholder='password'
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordErr(null);
                        }}
                    />
                    {passwordErr ? (
                        <p style={{ color: 'red' }}>{passwordErr}</p>
                    ) : (
                        <p></p>
                    )}
                </div>
                {error ? <p style={{ color: 'red' }}>{error}</p> : null}
                <div>
                    <input
                        type='submit'
                        value='Sign in'
                        onClick={handleClick}
                    />
                </div>
            </form>
            <Link href={'/signup'}>Don't you have an account yet?</Link>
        </div>
    );
}
