import { motion } from 'motion/react';
export function AnimateButton({
    title,
    onClick,
    className,
    disabled = false,
    type = 'submit',
}) {
    return (
        <motion.button
            whileHover={{
                scale: 1.1,
                transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.8 }}
            className={className}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {title}
        </motion.button>
    );
}
