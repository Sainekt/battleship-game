'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SignUpBody {
    username: string;
    password: string;
    email?: string;
}

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [usernameErr, setUsernameErr] = useState(null);
    const [passwordErr, setPasswordErr] = useState(null);
    const [emailErr, setEmailErr] = useState(null);
    const [confirmPasswordErr, setConfirmPasswordErr] = useState(null);
    const router = useRouter();

    const required: [string | null, (value: string) => void][] = [
        [username, setUsernameErr],
        [password, setPasswordErr],
        [confirmPassword, setConfirmPasswordErr],
    ];

    async function handleClick(event) {
        event.preventDefault();
        if (!username || !password || !confirmPassword) {
            required.forEach(([value, func]) => {
                if (!value) func('You forgot this field');
            });
            return;
        }
        if (password !== confirmPassword) {
            return setConfirmPasswordErr('Passwords do not match');
        }
        const body: SignUpBody = { username: username, password: password };
        if (email) {
            body.email = email;
        }
        const domain = `${location.protocol}//${location.host}`;
        const response = await fetch(`${domain}/api/signup`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
        if (response.status === 201) {
            return router.push('/signin');
        }
        const data = await response.json();
        if (data.data.error) {
            setError(data.data.error);
        }
        if (response.status >= 400) {
            setUsernameErr(data.data.username);
            setPasswordErr(data.data.password);
            setEmailErr(data.data.email);
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
                    <h1 className='text-2xl font-bold text-gray-700'>
                        Sign up
                    </h1>
                </div>
                <form method='POST'>
                    <div className='mb-4'>
                        <label
                            className='block text-sm font-medium text-gray-700'
                            htmlFor='username'
                        >
                            Enter your username:
                        </label>
                        <input
                            type='text'
                            name='username'
                            id='username'
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
                            Enter your password:
                        </label>
                        <input
                            type='password'
                            name='password'
                            id='password'
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
                    <div className='mb-4'>
                        <label
                            className='block text-sm font-medium text-gray-700'
                            htmlFor='password'
                        >
                            Confirm your password:
                        </label>
                        <input
                            type='password'
                            name='password'
                            id='password'
                            placeholder='password'
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setConfirmPasswordErr(null);
                            }}
                            className={`mt-1 
                    block w-full p-2 
                    border border-gray-300 
                    rounded-md focus:outline-none focus:ring
                     ${
                         confirmPasswordErr
                             ? 'focus:ring-red-500 border-red-500'
                             : 'focus:ring-blue-500'
                     }`}
                        />
                        {confirmPasswordErr && (
                            <p className='text-red-500 text-sm'>
                                {confirmPasswordErr}
                            </p>
                        )}
                    </div>
                    <div className='mb-4'>
                        <label
                            className='block text-sm font-medium text-gray-700'
                            htmlFor='password'
                        >
                            Enter your email:
                        </label>
                        <input
                            type='email'
                            name='password'
                            id='password'
                            placeholder='not required'
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailErr(null);
                                setError(null);
                            }}
                            className={`mt-1 
                    block w-full p-2 
                    border border-gray-300 
                    rounded-md focus:outline-none focus:ring
                     ${
                         emailErr
                             ? 'focus:ring-red-500 border-red-500'
                             : 'focus:ring-blue-500'
                     }`}
                        />
                        {emailErr && (
                            <p className='text-red-500 text-sm'>{emailErr}</p>
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
                <Link href={'/signin'}>
                    <h6 className='text-center text-blue-500 mt-4 cursor-pointer hover:text-blue-600'>
                        Sign in!
                    </h6>
                </Link>
            </div>
        </div>
    );
}
