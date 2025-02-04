'use client';
import Modal from './Modal';
import { socket } from './Room';
import { useEffect, useState } from 'react';
import { userStore, gameState } from '../context/Context';

export default function FindGame({ handleSetModal }) {
    const [rooms, setRooms] = useState(null);
    const [modal, setModal] = useState(false);
    const [changeRoom, setChangeRoom] = useState(null);
    const { username } = userStore((state) => state);
    const { roomId } = gameState((state) => state);

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
        socket.emit('joinRoom', connectRoomId, username);
    }

    function handleAcceptChangeRoom() {
        socket.emit('leaveRoom', username);
        socket.emit('joinRoom', changeRoom, username);
        setModal(false);
    }

    function handleRejectChangeRoom() {
        setModal(false);
    }
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
                        title: 'Room already joined',
                        text: `You are already in the room: ${roomId}.
                              \nAre you sure you want to leave the current room and move to another one ?`,
                    }}
                    eventAccept={handleAcceptChangeRoom}
                    eventReject={handleRejectChangeRoom}
                />
            ) : null}
            <div
                className='modal modal-navbar'
                tabIndex='-1'
                onClick={closeModal}
            >
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
