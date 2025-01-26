import { useState } from 'react';
import { HEADERS } from '../utils/constants';
import { userStore } from '../context/Context';

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
        }
    }

    return (
        <div className='container'>
            <form method='POST'>
                <div>
                    <label htmlFor='password'>Enter old password:</label>
                    <br />
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
                    />
                    {passwordErr ? (
                        <p style={{ color: 'red' }}>{passwordErr}</p>
                    ) : (
                        <p></p>
                    )}
                </div>
                <div>
                    <label htmlFor='newPassword'>
                        Enter your new password:
                    </label>
                    <br />
                    <input
                        type='password'
                        name='newPassword'
                        id='newPassword'
                        placeholder='confirm password'
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            setNewPasswordErr(null);
                        }}
                    />
                    {newPasswordErr ? (
                        <p style={{ color: 'red' }}>{newPasswordErr}</p>
                    ) : (
                        <p></p>
                    )}
                </div>
                <div>
                    <label htmlFor='confirmPassword'>
                        Confirm your new password:
                    </label>
                    <br />
                    <input
                        type='password'
                        name='confirmPassword'
                        id='confirmPassword'
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
                    {success ? (
                        <p style={{ color: 'green' }}>
                            The data has been updated
                        </p>
                    ) : null}

                    <input type='submit' value='update' onClick={handleClick} />
                </div>
            </form>
        </div>
    );
}
