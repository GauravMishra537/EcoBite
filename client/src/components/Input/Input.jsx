import styles from './Input.module.css';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    icon: Icon,
    required = false,
    disabled = false,
    textarea = false,
    className = '',
    ...props
}) => {
    const Tag = textarea ? 'textarea' : 'input';

    const inputClasses = [
        textarea ? `${styles.input} ${styles.textarea}` : styles.input,
        error && styles['input--error'],
        Icon && styles['input--withIcon'],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={styles.inputGroup}>
            {label && (
                <label htmlFor={name} className={styles.label}>
                    {label}
                    {required && <span style={{ color: 'var(--color-error)' }}> *</span>}
                </label>
            )}
            <div className={styles.inputWrapper}>
                {Icon && <Icon className={styles.icon} />}
                <Tag
                    id={name}
                    type={!textarea ? type : undefined}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={inputClasses}
                    {...props}
                />
            </div>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
};

export default Input;
