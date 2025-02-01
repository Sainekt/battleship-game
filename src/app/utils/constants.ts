export const HEADERS: HeadersInit = { 'Content-Type': 'application/json' };
export const CLEAR_BOARD = Array(100).fill(null);
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

export const VALID_COORD = {
    0: [1, 10, 11],
    10: [0, 1, 11, 20, 21],
    20: [10, 11, 21, 30, 31],
    30: [20, 21, 31, 40, 41],
    40: [30, 31, 41, 50, 51],
    50: [40, 41, 51, 60, 61],
    60: [50, 51, 61, 70, 71],
    70: [60, 61, 71, 80, 81],
    80: [70, 71, 81, 90, 91],
    90: [80, 81, 91],
    9: [8, 18, 19],
    19: [8, 9, 18, 28, 29],
    29: [18, 19, 28, 38, 39],
    39: [28, 29, 38, 48, 49],
    49: [38, 39, 48, 58, 59],
    59: [48, 49, 58, 68, 69],
    69: [58, 59, 68, 78, 79],
    79: [68, 69, 78, 88, 89],
    89: [78, 79, 88, 98, 99],
    99: [88, 89, 98],
};

export const TIME_FOR_RECONNECT = 120;
