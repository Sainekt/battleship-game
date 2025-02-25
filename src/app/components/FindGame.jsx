'use client';
import Modal from './Modal';
import { AnimateButton } from '../components/AnimateButton';
import { socket } from './Room';
import { useEffect, useState } from 'react';
import { userStore, gameState } from '../context/Context';
import { motion } from 'motion/react';

export default function FindGame({ handleSetModal }) {
    const [rooms, setRooms] = useState(null);
    const [modal, setModal] = useState(false);
    const [changeRoom, setChangeRoom] = useState(null);
    const { username } = userStore((state) => state);
    const { roomId, setRoomId } = gameState((state) => state);
    const [oldRoom, setOldRoom] = useState(roomId);

    function closeModal() {
        handleSetModal();
    }
    function handeDialog(event) {
        event.stopPropagation();
    }
    function handleJoinRoom(connectRoomId) {
        if (roomId) {
            setModal(true);
            setChangeRoom(connectRoomId);
            return;
        }
        socket.emit('checkRoom', connectRoomId, username);
    }

    function handleAcceptChangeRoom() {
        socket.emit('leaveRoom', username);
        setRoomId(null);
        socket.emit('checkRoom', changeRoom, username);
        setModal(false);
    }

    function handleRejectChangeRoom() {
        setModal(false);
    }

    // Close the window if it is connected to the room.
    useEffect(() => {
        if (oldRoom === roomId) return;
        closeModal();
    }, [oldRoom, roomId]);

    // request rooms array
    useEffect(() => {
        const interval = setInterval(() => {
            socket.emit('getRoomArray');
        }, 1000);

        function handleGetRoomArray(array) {
            const filterArray = array.filter((value) => {
                if (value && value !== username) {
                    return value;
                }
            });
            setRooms(filterArray);
        }
        socket.on('getRoomArray', handleGetRoomArray);

        return () => {
            clearInterval(interval);
            socket.off('getRoomArray', handleGetRoomArray);
        };
    }, []);

    return (
        <>
            {modal ? (
                <Modal
                    data={{
                        title: 'Already in the room',
                        text: `You are already in the room: ${roomId}.
                              \nAre you sure you want to leave the current room and move to another one ?`,
                    }}
                    eventAccept={handleAcceptChangeRoom}
                    eventReject={handleRejectChangeRoom}
                />
            ) : null}
            <div className='fixed inset-0 bg-black bg-opacity-50'></div>

            <motion.div
                initial={{ opacity: 0, y: '-100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '+100%' }}
                key={'FindGame'}
                tabIndex='-1'
                onClick={closeModal}
                className='flex overflow-y-auto  fixed  justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full'
            >
                <div
                    className='relative p-4 w-full max-w-xl max-h-full'
                    onClick={handeDialog}
                >
                    <div className='relative bg-white rounded-lg shadow-sm'>
                        <div className='border-b p-2 text-center bg-gray-100 rounded-t-lg'>
                            <h2 className='text-lg font-bold text-gray-800'>
                                Find Game
                            </h2>
                        </div>
                        <motion.button
                            whileHover={{
                                scale: 1.1,
                                transition: { duration: 0.2 },
                            }}
                            whileTap={{ scale: 0.8 }}
                            onClick={closeModal}
                            className='absolute top-2 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-400 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center'
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
                            <span className='sr-only'>Close modal</span>
                        </motion.button>
                        <div className='p-4 md:p-5 text-center'>
                            <h3 className='mb-5 text-lg font-normal text-gray-800'>
                                <div className='modal-body'>
                                    {!rooms || rooms.length === 0 ? (
                                        <h2>Game Search...</h2>
                                    ) : (
                                        rooms.map((room) => {
                                            return (
                                                <div
                                                    key={room}
                                                    className='flex justify-evenly bg-gray-100 rounded-lg p-2 m-1'
                                                >
                                                    {room}
                                                    <br />
                                                    <AnimateButton
                                                        className=' w-32 h-8 bg-blue-500 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-full'
                                                        onClick={() =>
                                                            handleJoinRoom(room)
                                                        }
                                                        title='Join'
                                                    ></AnimateButton>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </h3>
                            <AnimateButton
                                className='text-white bg-red-500 hover:bg-red-600 w-32 h-11 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-full'
                                onClick={closeModal}
                                title={'Close'}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
