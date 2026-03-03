import { Link } from 'react-router-dom';
import { Button } from '../../components';
import styles from './NotFound.module.css';

const NotFound = () => {
    return (
        <div className={styles.notFound}>
            <div className={styles.notFound__code}>404</div>
            <h1 className={styles.notFound__title}>Page Not Found</h1>
            <p className={styles.notFound__text}>
                Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/">
                <Button variant="primary">Back to Home</Button>
            </Link>
        </div>
    );
};

export default NotFound;
