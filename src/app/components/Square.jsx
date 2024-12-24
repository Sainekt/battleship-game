export default function Square({ value, disabled, onSquareClick }) {
    return (
        <button
            className={disabled ? 'square square-disabled' : 'square'}
            disabled={disabled}
            onClick={onSquareClick}
        >
            {value}
        </button>
    );
}
