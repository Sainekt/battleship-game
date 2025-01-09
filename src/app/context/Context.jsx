import { create } from 'zustand';
import { checkLife } from '../utils/utils';

const fleet = [
    { id: 4, size: 4, quantity: 1, type: ['A'] },
    { id: 3, size: 3, quantity: 2, type: ['B', 'C'] },
    { id: 2, size: 2, quantity: 3, type: ['D', 'E', 'F'] },
    { id: 1, size: 1, quantity: 4, type: ['G', 'H', 'I', 'J'] },
];

export const useStore = create((set, get) => ({
    gameStart: true,
    playersTurn: null,
    fleet1: [...fleet],
    fleet2: [...fleet],
    squares: Array(100).fill(null),
    ship: null,
    direction: null,
    ready: false,
    allShipPlaced: false,

    checkAllShipPlaced: (fleet = get().fleet1) => {
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

    sizeDecrement: () => {
        const fleet = get().fleet1;
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
                set({ fleet1: updatedFleet, ship: null, direction: null });
                get().checkAllShipPlaced(updatedFleet);
            }
            set({ fleet1: updatedFleet });
            return true;
        }
        return false;
    },
    reset: () => {
        set({ ship: null, fleet1: [...fleet] });
    },
}));

export const userStore = create((set, get) => ({
    username: null,
    games: null,
    victories: null,
    avg: null,
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
    boardPlayer1: null,
    boardPlayer2: null,
    winner: null,
    roomId: null,
    game: false,

    setGame: (bool) => set({ game: bool }),
    setPlayer1: (id) => set({ player1: id }),
    setPlayer2: (id) => set({ player2: id }),
    setPlayer1Ready: (bool) => set({ player1Ready: bool }),
    setPlayer2Ready: (bool) => set({ player2Ready: bool }),
    setBoardPlayer1: (board) => set({ boardPlayer1: board }),
    setBoardPlayer2: (board) => set({ boardPlayer2: board }),
    setRoomId: (id) => {
        set({ roomId: id });
    },

    checkGame: (board, squares) => {
        const destroyedShips = checkLife(board, squares);
        if (destroyedShips.length === 10) {
            // to do winner
        }
        return destroyedShips;
    },
}));
