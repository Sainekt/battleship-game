'use client';
import { useEffect, useState } from 'react';
import { userStore } from '../context/Context';
import { HEADERS } from '../utils/constants';
import ChangeProfile from './ChangeProfileForm';
export default function Profile({ handleSetModal }) {
    const { id, username, email, games, victories, avg } = userStore(
        (state) => state
    );
    const [parseGames, setParseGames] = useState(null);
    const [changeUserdata, setChangeUserData] = useState(false);
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

    function toggleChangeUserData() {
        setChangeUserData(!changeUserdata);
    }
    function closeModal() {
        handleSetModal();
    }
    function handeDialog(event) {
        event.stopPropagation();
    }
    return (
        <>
            <div
                className='modal modal-navbar'
                tabIndex='-1'
                onClick={closeModal}
            >
                <div className='modal-dialog' onClick={handeDialog}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h3 className='modal-title'>Profile</h3>
                        </div>
                        <div className='modal-body'>
                            <h4>User ID: {id}</h4>
                            <h4>Username: {username}</h4>
                            <h4>email: {email}</h4>
                            {changeUserdata ? <ChangeProfile /> : null}
                            <button onClick={toggleChangeUserData}>
                                {changeUserdata ? 'close' : 'change password'}
                            </button>
                            <h4>Victories: {victories}</h4>
                            <h4>Lost: {games.length - victories}</h4>
                            <h4>AVG: {avg}</h4>
                            <br />
                            <h4>Games Played: {games.length}</h4>
                            {parseGames
                                ? parseGames.map((value) => {
                                      return (
                                          <div
                                              className='game-history'
                                              key={value.id}
                                          >
                                              <div className='game-header'>
                                                  <h5>Game ID: {value.id}</h5>
                                                  {value.winner === username
                                                      ? 'Victory'
                                                      : 'Defeat'}
                                              </div>
                                              <div className='game-players'>
                                                  <span className='player'>
                                                      {value.player_1}
                                                  </span>{' '}
                                                  VS{' '}
                                                  <span className='player'>
                                                      {value.player_2}
                                                  </span>
                                              </div>
                                              Winner:{' '}
                                              {value.winner === username
                                                  ? 'You'
                                                  : value.winner}
                                          </div>
                                      );
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
