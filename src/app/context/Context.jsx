'use  client';
import { create } from 'zustand';
import { checkLife } from '../utils/utils';
import { FLEET, CLEAR_BOARD } from '../utils/constants';

export const useStore = create((set, get) => ({
    fleet: [...FLEET],
    squares: CLEAR_BOARD,
    squaresBoard2: CLEAR_BOARD,
    ship: null,
    direction: null,
    ready: false,
    allShipPlaced: false,
    setFleet: (fleet) => set({ fleet }),
    setSquaresBoard2: (squares) => set({ squaresBoard2: squares }),

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
    setReady: (bool = undefined) =>
        typeof bool === 'undefined'
            ? set({ ready: !get().ready })
            : set({ ready: bool }),
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

    boardsAndReadyReset: () =>
        set({
            ready: false,
            squaresBoard2: CLEAR_BOARD,
        }),

    boardRematchReset: () =>
        set({
            squaresBoard2: CLEAR_BOARD,
            ready: false,
            squares: CLEAR_BOARD,
            fleet: [...FLEET],
        }),
}));

export const userStore = create((set, get) => ({
    id: null,
    username: null,
    email: null,
    games: [],
    victories: null,
    avg: null,
    kickedPlayers: new Set(),
    setKickedPlayers: (player) =>
        set({ kickedPlayers: get().kickedPlayers.add(player) }),
    setId: (id) => set({ id: id }),
    setEmail: (email) => set({ email: email }),
    setUsername: (username) => set({ username: username }),
    setGames: (games) => set({ games: games }),
    setVictories: (victories) => set({ victories: victories }),
    setAvg: (avg) => set({ avg: avg }),
}));

export const gameState = create((set, get) => ({
    player1: null,
    player2: null,
    enemyId: null,
    player1Ready: false,
    player2Ready: false,
    myBoard: null,
    enemyBoard: CLEAR_BOARD,
    winner: null,
    roomId: null,
    game: false,
    gameId: null,
    motion: null,
    move: false,
    timer: 0,
    stop: false,
    setStop: (bool) => set({ stop: bool }),
    setGameId: (id) => set({ gameId: id }),
    setMove: (bool) => set({ move: bool }),
    setTimer: (time) => set({ timer: time }),
    setMotion: (user) => set({ motion: user }),
    setGame: (bool) => set({ game: bool }),
    setPlayer1: (id) => set({ player1: id }),
    setPlayer2: (id) => set({ player2: id }),
    setEnemyId: (number) => set({ enemyId: number }),
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
        return destroyedShips;
    },
    gameStateReset: () =>
        set({
            game: false,
            motion: null,
            timer: 0,
            gameId: null,
            enemyBoard: CLEAR_BOARD,
            player1Ready: false,
            player2Ready: false,
            winner: null,
        }),
}));
