import { create } from 'zustand';

const fleet = [
    { id: 4, size: 4, quantity: 1 },
    { id: 3, size: 3, quantity: 2 },
    { id: 2, size: 2, quantity: 3 },
    { id: 1, size: 1, quantity: 4 },
];

const useStore = create((set) => ({
    player1: null,
    player2: null,
    playersTurn: null,
    fleet1: [...fleet],
    fleet2: [...fleet],
    ship: null,
    setShip: (id) => set(() => {
        return {ship: id}
    })


}));

export default useStore;
