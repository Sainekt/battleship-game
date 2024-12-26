export function getStyle(start = false, disabled = false, ship = false){
    if (disabled) {
        return 'square-disabled square'
    }
    if (ship && ship !== '•') {
        return 'square-panel square'
    }
    
    return 'square'
}