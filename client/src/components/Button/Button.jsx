import styles from './Button.module.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    type = 'button',
    onClick,
    className = '',
    ...props
}) => {
    const classes = [
        styles.btn,
        styles[`btn--${variant}`],
        size !== 'md' && styles[`btn--${size}`],
        fullWidth && styles['btn--full'],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && <span className={styles.btn__spinner} />}
            {children}
        </button>
    );
};

export default Button;
