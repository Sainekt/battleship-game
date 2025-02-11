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
            setUsernameErr(data.data.username);
            setPasswordErr(data.data.password);
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
            <div className='bg-white p-8 rounded-lg shadow-md w-96'>
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1.0'
                />
                <div className='text-center mb-6'>
                    <h1 className='text-2xl font-bold text-gray-700'>Sign in</h1>
                </div>
                <form method='POST'>
                    <div className='mb-4'>
                        <label
                            className='block text-sm font-medium text-gray-700'
                            htmlFor='username'
                        >
                            Username:
                        </label>
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
                            className={`mt-1 
                                block w-full p-2 
                                border border-gray-300 
                                rounded-md focus:outline-none focus:ring
                                 ${
                                     usernameErr
                                         ? 'focus:ring-red-500 border-red-500'
                                         : 'focus:ring-blue-500'
                                 }`}
                        />
                        {usernameErr && (
                            <p className='text-red-500 text-sm'>
                                {usernameErr}
                            </p>
                        )}
                    </div>

                    <div className='mb-4'>
                        <label
                            className='block text-sm font-medium text-gray-700'
                            htmlFor='password'
                        >
                            Password:
                        </label>
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
                            className={`mt-1 
                                block w-full p-2 
                                border border-gray-300 
                                rounded-md focus:outline-none focus:ring
                                 ${
                                     passwordErr
                                         ? 'focus:ring-red-500 border-red-500'
                                         : 'focus:ring-blue-500'
                                 }`}
                        />
                        {passwordErr && (
                            <p className='text-red-500 text-sm'>
                                {passwordErr}
                            </p>
                        )}
                    </div>

                    {error && (
                        <p className='text-red-500 text-sm mb-4'>{error}</p>
                    )}

                    <input
                        type='submit'
                        value='Login'
                        className='w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200'
                        onClick={handleClick}
                    />
                </form>
                <Link href={'/signup'}>
                    <h6 className='text-center text-blue-500 mt-4 cursor-pointer hover:text-blue-600'>
                        Sign Up!
                    </h6>
                </Link>
            </div>
        </div>
    );
}
