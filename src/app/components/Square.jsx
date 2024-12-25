export default function Square({
    value,
    disabled,
    onSquareClick,
    className,
}) {
    return (
        <button
            className={className}
            disabled={disabled}
            onClick={onSquareClick}
            value={value}
            hidden={true}
        ></button>
    );
}
