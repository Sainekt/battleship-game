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
            <span hidden={true}>{text}</span>
        </button>
    );
}
