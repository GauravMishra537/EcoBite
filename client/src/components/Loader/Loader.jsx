import styles from './Loader.module.css';

const Loader = ({ size = 'md', fullPage = false }) => {
    const spinnerClasses = [
        styles.spinner,
        size !== 'md' && styles[`spinner--${size}`],
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={`${styles.loader} ${fullPage ? styles['loader--fullPage'] : ''}`}>
            <div className={spinnerClasses} />
        </div>
    );
};

export default Loader;
