'use client';
import { socket } from './Room';
import { useEffect, useState } from 'react';
import { userStore } from '../context/Context';

export default function FindGame({ handleSetModal }) {
    const [rooms, setRooms] = useState(null);
    const { username } = userStore((state) => state);
    function closeModal() {
        handleSetModal();
    }
    function handeDialog(event) {
        event.stopPropagation();
    }
    function handleJoinRoom(roomId) {
        socket.emit('joinRoom', roomId, username);
    }
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
            <div className='modal' tabIndex='-1' onClick={closeModal}>
                <div className='modal-dialog' onClick={handeDialog}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h3 className='modal-title'>Find Game</h3>
                        </div>
                        <div className='modal-body'>
                            {!rooms || rooms.length === 0 ? (
                                <h2>Game Search...</h2>
                            ) : (
                                rooms.map((room) => {
                                    return (
                                        <div key={room} className='room-block'>
                                            <p>
                                                {room}
                                                <br />
                                                <button
                                                    className='button-nav'
                                                    onClick={() =>
                                                        handleJoinRoom(room)
                                                    }
                                                >
                                                    Join Room
                                                </button>
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className='modal-footer'>
                            <button
                                className='logout-btn'
                                onClick={handleSetModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
