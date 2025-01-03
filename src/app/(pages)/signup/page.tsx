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

    async function handleClick(event) {
        event.preventDefault();
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
        if (data.error) {
            setError(data.error);
        }
        if (response.status >= 400) {
            setUsernameErr(data.username);
            setPasswordErr(data.password);
            setEmailErr(data.email);
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
                <div>
                    <label htmlFor='confirmPassword'>
                        Confirm your password:
                    </label>
                    <br />
                    <input
                        type='password'
                        name='confirmPassword'
                        id='confirmPassword'
                        required
                        placeholder='confirm password'
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setConfirmPasswordErr(null);
                        }}
                    />
                    {confirmPasswordErr ? (
                        <p style={{ color: 'red' }}>{confirmPasswordErr}</p>
                    ) : (
                        <p></p>
                    )}
                </div>
                <div>
                    <label htmlFor='email'> Enter your email:</label>
                    <br />
                    <input
                        type='email'
                        name='email'
                        id='email'
                        placeholder='not required'
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailErr(null);
                            setError(null);
                        }}
                    />
                    <br />
                    {emailErr ? (
                        <p style={{ color: 'red' }}>{emailErr}</p>
                    ) : (
                        <p></p>
                    )}
                </div>
                <div>
                    {error ? <p style={{ color: 'red' }}>{error}</p> : null}

                    <input
                        type='submit'
                        value='Sign up'
                        onClick={handleClick}
                    />
                </div>
            </form>
            <Link href={'/signin'}>Do you already have an account?</Link>
        </div>
    );
}
