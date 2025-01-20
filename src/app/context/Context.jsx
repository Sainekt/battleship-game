'use  client';
import { create } from 'zustand';
import { checkLife } from '../utils/utils';
import { socket } from '../components/Room';
import { FLEET } from '../utils/constants';

export const useStore = create((set, get) => ({
    gameStart: true,
    playersTurn: null,
    fleet: [...FLEET],
    squares: Array(100).fill(null),
    ship: null,
    direction: null,
    ready: false,
    allShipPlaced: false,
    setFleet: (fleet) => set({ fleet }),

    checkAllShipPlaced: () => {
        const fleet = get().fleet;
        const count = fleet.reduce((accum, current) => {
            if (!current.quantity && !current.size) {
                accum++;
            }
            return accum;
        }, 0);
        if (count === 4) {
            set({ allShipPlaced: true });
            return;
        }
        set({ allShipPlaced: false });
    },
    setSquares: (value) => set({ squares: value }),
    setDirection: (direction) => set({ direction: direction }),
    setReady: () => set({ ready: !get().ready }),

    setShip: (id) =>
        set(() => ({
            ship: id,
        })),

    sizeDecrement: (newValues) => {
        const fleet = get().fleet;
        const ship = get().ship;
        const shipObjIndex = fleet.findIndex((shipObj) => shipObj.id === +ship);

        const shipObj = { ...fleet[shipObjIndex] };

        let updatedFleet = [...fleet];

        if (shipObj.size > 0) {
            shipObj.size--;
            if (!shipObj.size) {
                set({ direction: null });
            }
            if (shipObj.size === 0 && shipObj.quantity > 0) {
                shipObj.quantity--;
                shipObj.size = shipObj.quantity ? shipObj.id : 0;
            }
            updatedFleet[shipObjIndex] = {
                ...shipObj,
            };

            if (!shipObj.size && !shipObj.quantity > 0) {
                set({ fleet: updatedFleet, ship: null, direction: null });
                get().checkAllShipPlaced(updatedFleet);
                localStorage.setItem('squares', JSON.stringify(newValues));
                localStorage.setItem('fleet', JSON.stringify(updatedFleet));
            }
            set({ fleet: updatedFleet });
            set({ squares: newValues });
            return true;
        }
        return false;
    },
    reset: () => {
        set({ ship: null, fleet: [...FLEET] });
    },
}));

export const userStore = create((set, get) => ({
    id: null,
    username: null,
    games: null,
    victories: null,
    avg: null,
    setId: (id) => set({ id: id }),
    setUsername: (username) => set({ username: username }),
    setGames: (games) => set({ games: games }),
    setVictories: (victories) => set({ victories: victories }),
    setAvg: (avg) => set({ avg: avg }),
}));

export const gameState = create((set, get) => ({
    player1: null,
    player2: null,
    player1Ready: false,
    player2Ready: false,
    myBoard: null,
    enemyBoard: Array(100).fill(null),
    winner: null,
    roomId: null,
    game: false,
    gameId: false,
    motion: null,
    move: false,
    timer: 0,
    setGameId: (id) => set({ gameId: id }),
    setMove: (bool) => set({ move: bool }),
    setTimer: (time) => set({ timer: time }),
    setMotion: (user) => set({ motion: user }),
    setGame: (bool) => set({ game: bool }),
    setPlayer1: (id) => set({ player1: id }),
    setPlayer2: (id) => set({ player2: id }),
    setPlayer1Ready: (bool) => set({ player1Ready: bool }),
    setPlayer2Ready: (bool) => set({ player2Ready: bool }),
    setMyBoard: (board) => set({ myBoard: board }),
    setEnemyBoard: (board) => set({ enemyBoard: board }),
    setRoomId: (id) => {
        set({ roomId: id });
    },
    setWinner: (winner) => set({ winner: winner }),
    checkGame: (board, squares) => {
        const destroyedShips = checkLife(board, squares);
        if (destroyedShips.length === 10) {
            socket.emit('setWinner', get().motion);
        }
        return destroyedShips;
    },
}));
