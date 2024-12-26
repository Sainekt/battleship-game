export default function Square({
    value,
    disabled,
    onSquareClick,
    className,
    text,
}) {
    return (
        <button
            className={className}
            disabled={disabled}
            onClick={onSquareClick}
            value={value}
        >
            <span hidden={text === 'X' || text === '•' ? false : true}>
                {text}
            </span>
        </button>
    );
}
