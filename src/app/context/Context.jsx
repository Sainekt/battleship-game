import { create } from 'zustand';

const fleet = [
    { name: 'Battleship', size: 4, quantity: 1 },
    { name: 'Cruiser', size: 3, quantity: 2 },
    { name: 'Submarine', size: 2, quantity: 3 },
    { name: 'Destroyer', size: 1, quantity: 4 },
];

const useStore = create((set) => ({
    player1: null,
    player2: null,
    playersTurn: player1,
    fleet1: [...fleet],
    fleet2: [...fleet],
}));

export default useStore;
