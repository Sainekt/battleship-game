import { create } from 'zustand';

const fleet = [
    { id: 4, size: 4, quantity: 1, type: ['A']},
    { id: 3, size: 3, quantity: 2, type: ['B', 'C'] },
    { id: 2, size: 2, quantity: 3, type: ['D', 'E', 'F'] },
    { id: 1, size: 1, quantity: 4, type: ['G', 'H', 'I', 'J'] },
];

const useStore = create((set, get) => ({
    player1: null,
    player2: null,
    playersTurn: null,
    fleet1: [...fleet],
    fleet2: [...fleet],
    ship: null,

    setShip: (id) =>
        set(() => ({
            ship: id,
        })),

    sizeDecrement: () => {
        const fleet = get().fleet1;
        const ship = get().ship;
        const shipObjIndex = fleet.findIndex((shipObj) => shipObj.id === +ship);

        if (shipObjIndex !== -1) {
            const shipObj = fleet[shipObjIndex];

            let updatedFleet = [...fleet];

            if (shipObj.size > 0) {
                console.log(1);
                
                updatedFleet[shipObjIndex] = {
                    ...shipObj,
                    size: shipObj.size - 1,
                };

                set({ fleet1: updatedFleet });
                return true;
            } else if (shipObj.size === 0 && shipObj.quantity > 1) {
                updatedFleet[shipObjIndex] = {
                    ...shipObj,
                    quantity: shipObj.quantity - 1,
                    size: shipObj.size + shipObj.id - 1,
                };
                set({ fleet1: updatedFleet }); // Обновляем состояние
                return true;
            } else if (shipObj.size === 0 && shipObj.quantity === 1) {
                updatedFleet[shipObjIndex] = {
                    ...shipObj,
                    quantity: 0,
                };
                set({ fleet1: updatedFleet });
                set({ ship: null });
                return false
            }
        }
        set({ ship: null });
        return false;
    },
    reset: () => {
        set({ ship: null, fleet1: [...fleet] });
    },
}));

export default useStore;
