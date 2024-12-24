export default function Square({ value, disabled, onSquareClick , className, text}) {
    
    return (
        <button
            className={className}
            disabled={disabled}
            onClick={onSquareClick}
            value={value}
        >{text}
        </button>
    );
}
