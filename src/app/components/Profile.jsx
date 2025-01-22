'use client';
import { useEffect, useState } from 'react';
import { userStore } from '../context/Context';
import { HEADERS } from '../utils/constants';

export default function Profile({ handleSetModal }) {
    const { id, username, games, victories, avg } = userStore((state) => state);
    const [parseGames, setParseGames] = useState(null);
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
                    const parsedGames = games.map((game) => {
                        const update = { ...game };
                        update.player_1 = users[update.player_1];
                        update.player_2 = users[update.player_2];
                        update.winner = users[update.winner];
                        return update;
                    });
                    setParseGames(parsedGames);
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    function closeModal() {
        handleSetModal();
    }
    function handeDialog(event) {
        event.stopPropagation();
    }
    return (
        <>
            <div className='modal' tabIndex='-1' onClick={closeModal}>
                <div className='modal-dialog' onClick={handeDialog}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h3 className='modal-title'>Profile</h3>
                        </div>
                        <div className='modal-body'>
                            <h4>ID: {id}</h4>
                            <h4>Username: {username}</h4>
                            <h4>Victories: {victories}</h4>
                            <h4>Lost: {games.length - victories}</h4>
                            <h4>AVG: {avg}</h4>
                            <br />
                            <h4>Games Played: {games.length}</h4>
                            {parseGames
                                ? parseGames.map((value) => {
                                      console.log(value);
                                  })
                                : null}
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
