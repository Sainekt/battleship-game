import { useState } from 'react';
import { AnimateButton } from './AnimateButton';
import { HEADERS } from '../utils/constants';
import { userStore } from '../context/Context';
import classNames from 'classnames';

export default function ChangeProfile() {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [passwordErr, setPasswordErr] = useState(null);
    const [newPasswordErr, setNewPasswordErr] = useState(null);
    const [emailErr, setEmailErr] = useState(null);
    const [confirmPasswordErr, setConfirmPasswordErr] = useState(null);
    const [success, setSuccess] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [changeEmail, setChangeEmail] = useState(false);
    const { setEmail: setUserEmail } = userStore((state) => state);

    async function handleClick(event) {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            return setConfirmPasswordErr('Passwords do not match');
        }
        if (!password) {
            setPasswordErr('required field');
            return;
        }
        const formData = {
            password: password,
            newPassword: newPassword,
            email: email,
        };
        const body = {};
        for (const key in formData) {
            if (formData[key]) {
                body[key] = formData[key];
            }
        }
        if (Object.keys(body).length === 1 && body.password) {
            return setError('No fields to update');
        }
        const domain = `${location.protocol}//${location.host}`;
        const response = await fetch(`${domain}/api/users/me`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify(body),
        });
        if (response.status >= 500) {
            setError('sorry, server error, please try again later.');
            return;
        }
        const data = await response.json();
        if (data.error) {
            setError(data.error);
            return;
        }
        if (response.status >= 400) {
            setPasswordErr(data.password);
            setNewPasswordErr(data.newPassword);
            setEmailErr(data.email);
            return;
        }
        if (response.status === 200) {
            setUserEmail(data.email);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 2000);
        }
    }
    function togglePassword(event) {
        event.preventDefault();
        setChangePassword((perv) => !perv);
    }
    function toggleEmail(event) {
        event.preventDefault();
        setChangeEmail((perv) => !perv);
    }

    return (
        <>
            <div className='flex-col'>
                <div className='flex justify-center mb-4'>
                    <span className='text-gray-800 text-xl'>
                        Here you can change your password and email address.
                    </span>
                </div>

                <div className='flex justify-center bg-gray-50 border rounded-lg p-5'>
                    <form method='POST' className='max-w-72'>
                        <div className='mb-2'>
                            <label
                                className='block text-sm font-medium text-gray-700'
                                htmlFor='Oldpassword'
                            >
                                Enter old password:
                            </label>
                            <input
                                type='password'
                                name='Oldpassword'
                                id='Oldpassword'
                                placeholder='password'
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordErr(null);
                                }}
                                onKeyDown={(event) =>
                                    event.key === 'Enter'
                                        ? event.preventDefault()
                                        : null
                                }
                                className={classNames('input-field', {
                                    'focus:ring-red-500 border-red-500':
                                        passwordErr,
                                })}
                            />
                            {passwordErr && (
                                <p className='text-red-500 text-sm'>
                                    {passwordErr}
                                </p>
                            )}
                        </div>
                        <AnimateButton
                            onClick={togglePassword}
                            type='button'
                            className='w-full h-11 bg-blue-500 text-white rounded-full hover:bg-blue-600 mb-3'
                            title={'change password'}
                        ></AnimateButton>
                        {changePassword ? (
                            <>
                                <div className='mb-4'>
                                    <label
                                        className='block text-sm font-medium text-gray-700'
                                        htmlFor='newPassword'
                                    >
                                        Enter your new password:
                                    </label>
                                    <input
                                        type='password'
                                        name='newPassword'
                                        id='newPassword'
                                        placeholder='new password'
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setNewPasswordErr(null);
                                        }}
                                        className={classNames('input-field', {
                                            'focus:ring-red-500 border-red-500':
                                                newPasswordErr,
                                        })}
                                    />
                                    {newPasswordErr && (
                                        <p className='text-red-500 text-sm'>
                                            {newPasswordErr}
                                        </p>
                                    )}
                                </div>

                                <div className='mb-4'>
                                    <label
                                        className='block text-sm font-medium text-gray-700'
                                        htmlFor='confirmPassword'
                                    >
                                        Confirm your new password:
                                    </label>
                                    <input
                                        type='password'
                                        name='password'
                                        id='confirmPassword'
                                        placeholder='confirm new password'
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setConfirmPasswordErr(null);
                                        }}
                                        className={classNames('input-field', {
                                            'focus:ring-red-500 border-red-500':
                                                confirmPasswordErr,
                                        })}
                                    />
                                    {confirmPasswordErr && (
                                        <p className='text-red-500 text-sm'>
                                            {confirmPasswordErr}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : null}
                        <AnimateButton
                            onClick={toggleEmail}
                            type='button'
                            className='w-full h-11 bg-blue-500 text-white rounded-full hover:bg-blue-600 mb-3'
                            title='change email'
                        ></AnimateButton>
                        {changeEmail ? (
                            <>
                                {' '}
                                <div className='mb-4'>
                                    <label
                                        className='block text-sm font-medium text-gray-700'
                                        htmlFor='email'
                                    >
                                        Enter your new email:
                                    </label>
                                    <input
                                        type='email'
                                        name='password'
                                        id='email'
                                        placeholder='new email'
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setEmailErr(null);
                                            setError(null);
                                        }}
                                        className={classNames('input-field', {
                                            'focus:ring-red-500 border-red-500':
                                                emailErr,
                                        })}
                                    />
                                    {emailErr && (
                                        <p className='text-red-500 text-sm'>
                                            {emailErr}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : null}
                        {error && (
                            <p className='text-red-500 text-sm mb-4'>{error}</p>
                        )}
                        {success ? (
                            <div className=' text-green-400 mb-1'>
                                Data changed successfully
                            </div>
                        ) : null}

                        {password &&
                        ((newPassword && confirmPassword) || email) ? (
                            <AnimateButton
                                title='update profile'
                                className='w-full h-11 bg-blue-500 text-white rounded-full hover:bg-blue-600 mb-3'
                                onClick={handleClick}
                            />
                        ) : null}
                    </form>
                </div>
            </div>
        </>
    );
}
