export const HEAREDS: HeadersInit = { 'Content-Type': 'application/json' };
export const CHAR_LIST: Array<string> = [
    'А',
    'Б',
    'В',
    'Г',
    'Д',
    'Е',
    'Ж',
    'З',
    'И',
    'К',
];
export const TIME_FOR_START: number = 2;
export const TIME_FOR_MOTION: number = 15;
export const FLEET_COUNT = {
    A: 4,
    B: 3,
    C: 3,
    D: 2,
    E: 2,
    F: 2,
    G: 1,
    H: 1,
    I: 1,
    J: 1,
    X: 20,
    '•': 80,
};
export const FLEET = [
    { id: 4, size: 4, quantity: 1, type: ['A'] },
    { id: 3, size: 3, quantity: 2, type: ['B', 'C'] },
    { id: 2, size: 2, quantity: 3, type: ['D', 'E', 'F'] },
    { id: 1, size: 1, quantity: 4, type: ['G', 'H', 'I', 'J'] },
];
