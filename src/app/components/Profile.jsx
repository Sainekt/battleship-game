'use client';
import { useEffect, useState } from 'react';
import { userStore } from '../context/Context';
import { HEADERS } from '../utils/constants';
import { motion } from 'motion/react';
import ChangeProfile from './ChangeProfileForm';
import { AnimateButton } from './AnimateButton';
import classNames from 'classnames';

export default function Profile({ handleSetModal }) {
    const [open, setOpen] = useState('profile');

    const handleTabOpen = (tabCategory) => {
        setOpen(tabCategory);
    };
    function closeModal() {
        handleSetModal();
    }
    function handeDialog(event) {
        event.stopPropagation();
    }

    return (
        <>
            <div className='fixed inset-0 bg-black bg-opacity-50'></div>

            <motion.div
                initial={{ opacity: 0, y: '-100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '+100%' }}
                key={'Profile'}
                tabIndex='-1'
                onClick={closeModal}
                className='flex fixed inset-0 justify-center items-center'
            >
                <div className='flex justify-center items-center h-full w-full lg:w-1/2'>
                    <section
                        className='bg-white rounded-lg w-full h-[80vh] max-h-[80vh] overflow-y-auto'
                        onClick={handeDialog}
                    >
                        <div className='relative p-4 w-full h-full'>
                            <div className='flex flex-col flex-grow'>
                                <div className='sticky top-0 z-10 p-4 flex rounded-lg border border-gray-200 bg-gray-50'>
                                    <a
                                        onClick={() => handleTabOpen('profile')}
                                        className={`cursor-pointer rounded-full px-4 py-3 text-sm font-medium md:text-base lg:px-6 ${
                                            open === 'profile'
                                                ? 'bg-blue-500 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition duration-200'
                                                : 'text-body-color hover:bg-primary'
                                        }`}
                                    >
                                        Profile
                                    </a>
                                    <a
                                        onClick={() =>
                                            handleTabOpen('gamesHistory')
                                        }
                                        className={`cursor-pointer rounded-full px-4 py-3 text-sm font-medium md:text-base lg:px-6 ${
                                            open === 'gamesHistory'
                                                ? 'bg-blue-500 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition duration-200'
                                                : 'text-body-color hover:bg-primary'
                                        }`}
                                    >
                                        History
                                    </a>
                                    <a
                                        onClick={() =>
                                            handleTabOpen('changeProfile')
                                        }
                                        className={`cursor-pointer rounded-full px-4 py-3 text-sm font-medium md:text-base lg:px-6 ${
                                            open === 'changeProfile'
                                                ? 'bg-blue-500 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition duration-200'
                                                : 'text-body-color hover:bg-primary'
                                        }`}
                                    >
                                        Change profile
                                    </a>
                                    <motion.button
                                        whileHover={{
                                            scale: 1.1,
                                            transition: { duration: 0.2 },
                                        }}
                                        whileTap={{ scale: 0.8 }}
                                        onClick={closeModal}
                                        className='absolute end-3 top-5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-400 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center'
                                    >
                                        <svg
                                            className='w-3 h-3'
                                            aria-hidden='true'
                                            xmlns='http://www.w3.org/2000/svg'
                                            fill='none'
                                            viewBox='0 0 14 14'
                                        >
                                            <path
                                                stroke='currentColor'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                                            />
                                        </svg>
                                        <span className='sr-only'>
                                            Close modal
                                        </span>
                                    </motion.button>
                                </div>

                                <TabContent
                                    details={<ProfileInformation />}
                                    tabCategory='profile'
                                    open={open}
                                />
                                <TabContent
                                    details={<GamesHistory />}
                                    tabCategory='gamesHistory'
                                    open={open}
                                />
                                <TabContent
                                    details={<ChangeProfile />}
                                    tabCategory='changeProfile'
                                    open={open}
                                />
                                <div className='flex justify-center py-5'>
                                    <AnimateButton
                                        className='text-white bg-red-500 hover:bg-red-600 w-32 h-11 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-full'
                                        onClick={closeModal}
                                        title={'Close'}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </motion.div>
        </>
    );
}

const TabContent = ({ open, tabCategory, details }) => {
    return (
        <div>
            <div
                className={`p-6 text-base leading-relaxed text-body-color dark:text-dark-6 ${
                    open === tabCategory ? 'block' : 'hidden'
                } `}
            >
                {details}
            </div>
        </div>
    );
};

const ProfileInformation = () => {
    const { id, username, email, games, victories, avg } = userStore(
        (state) => state
    );
    return (
        <div className='flex flex-col items-center p-4 flex-grow'>
            <div className='flex flex-col text-center bg-gray-50 rounded-lg border p-5 mb-4 w-full flex-grow'>
                <span className='font-bold border-2 border-blue-400 rounded-lg p-1 min-w-[190px] text-2xl'>
                    Profile Information
                </span>
                <div>
                    <span className='font-bold mr-1'>User ID:</span>
                    {id}
                </div>
                <div>
                    <span className='font-bold mr-1'>Username:</span>
                    {username}
                </div>
                <div>
                    <span className='font-bold mr-1'>Email:</span>
                    {email}
                </div>
            </div>
            <div className='flex flex-col text-center bg-gray-50 rounded-lg border p-5 mb-4 w-full flex-grow'>
                <span className='font-bold border-2 border-blue-400 rounded-lg p-1 min-w-[190px] text-2xl'>
                    Stats
                </span>
                <div>
                    <span className='font-bold mr-1'>Victories:</span>
                    {victories}
                </div>
                <div>
                    <span className='font-bold mr-1'>Lost:</span>
                    {games.length - victories}
                </div>
                <div>
                    <span className='font-bold mr-1'>AVG:</span>
                    {avg}
                </div>
                <div>
                    <span className='font-bold mr-1'>Games Played:</span>
                    {games.length}
                </div>
            </div>
        </div>
    );
};

const GamesHistory = () => {
    const [parseGames, setParseGames] = useState(null);
    const { username, games } = userStore((state) => state);

    useEffect(() => {
        if (games.length === 0) {
            return;
        }
        const domain = `${location.protocol}//${location.host}`;
        fetch(`${domain}/api/users/`, { method: 'get', headers: HEADERS })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch /api/users');
                }

                response.json().then((data) => {
                    const users = data.reduce((acc, user) => {
                        acc[user.id] = user.username;
                        return acc;
                    }, {});
                    const getDurationTime = (finish, start) => {
                        const duration =
                            new Date(finish).getTime() / 1000 -
                            new Date(start).getTime() / 1000;
                        const durationMinutes = Math.floor(
                            (duration % 3600) / 60
                        );
                        const durationSeconds = duration % 60;
                        return { m: durationMinutes, s: durationSeconds };
                    };

                    const parsedGames = games.map((game) => {
                        const update = { ...game };
                        update.player_1 = users[update.player_1];
                        update.player_2 = users[update.player_2];
                        update.winner = users[update.winner];
                        update.start = new Date(
                            game.created_at
                        ).toLocaleString();
                        update.duration = getDurationTime(
                            game.updated_at,
                            game.created_at
                        );
                        return update;
                    });
                    setParseGames(parsedGames);
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <>
            <span className='text-2xl font-bold text-center text-gray-700'>
                Games Played: {games.length}
            </span>
            <div className='p-4'>
                {parseGames ? (
                    parseGames.map((value) => {
                        return (
                            <div
                                className='bg-gray-50 rounded-lg border p-4 mb-4'
                                key={value.id}
                            >
                                <div className='flex flex-col items-center'>
                                    <div className='flex flex-col sm:flex-row justify-between w-full'>
                                        <div className='text-sm text-gray-600'>
                                            {value.start}
                                        </div>
                                        <div className='font-bold text-gray-800 text-center my-2 sm:my-0'>
                                            Game ID: {value.id}
                                        </div>
                                        <span className='text-sm'>
                                            Duration: {value.duration.m} min{' '}
                                            {value.duration.s} sec
                                        </span>
                                    </div>
                                </div>
                                <div className='flex justify-center my-2'>
                                    <div
                                        className={classNames(
                                            'font-semibold text-center text-3xl ',
                                            {
                                                'text-green-500':
                                                    value.winner === username,
                                                'text-red-500':
                                                    value.winner !== username,
                                            }
                                        )}
                                    >
                                        {value.winner === username
                                            ? 'Victory'
                                            : 'Defeat'}
                                    </div>
                                </div>
                                <div className='flex flex-col sm:flex-row justify-evenly items-center'>
                                    <span className='font-bold text-gray-700 w-full sm:w-auto overflow-hidden text-center text-xl'>
                                        {value.player_1}
                                    </span>
                                    <div className='font-medium text-red-500 m-2 text-4xl'>
                                        VS
                                    </div>
                                    <span className='font-bold text-gray-700 w-full sm:w-auto overflow-hidden text-center text-xl'>
                                        {value.player_2}
                                    </span>
                                </div>
                                <div className='font-semibold text-gray-600 text-center'>
                                    Winner:{' '}
                                    {value.winner === username
                                        ? 'You'
                                        : value.winner}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className='text-gray-500'>No games played yet.</div>
                )}
            </div>
        </>
    );
};
