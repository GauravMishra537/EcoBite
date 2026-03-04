import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import { Loader, Button } from '../../components';
import toast from 'react-hot-toast';
import styles from './Booking.module.css';

const MyBookings = () => {
    const { isAuthenticated } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState('');

    useEffect(() => {
        if (!isAuthenticated) return;
        const load = async () => {
            setLoading(true);
            try {
                const data = await getMyBookings();
                setBookings(data.bookings || []);
            } catch { /* empty */ } finally {
                setLoading(false);
            }
        };
        load();
    }, [isAuthenticated]);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this booking?')) return;
        setCancellingId(id);
        try {
            await cancelBooking(id, 'Changed plans');
            setBookings((prev) =>
                prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b))
            );
            toast.success('Booking cancelled');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to cancel');
        } finally {
            setCancellingId('');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.booking}>
                <div className="container">
                    <div className={styles.booking__empty}>
                        <div className={styles.booking__emptyIcon}>🔐</div>
                        <h2>Please sign in</h2>
                        <Link to="/login"><Button variant="primary">Sign In</Button></Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.booking}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <div>
                        <h1 className={styles.booking__title}>My Bookings</h1>
                        <p className={styles.booking__subtitle} style={{ marginBottom: 0 }}>
                            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link to="/book-table"><Button variant="primary">+ Book Table</Button></Link>
                </div>

                {loading ? (
                    <Loader />
                ) : bookings.length === 0 ? (
                    <div className={styles.booking__empty}>
                        <div className={styles.booking__emptyIcon}>📋</div>
                        <h2>No bookings yet</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                            Book a table at your favorite restaurant
                        </p>
                        <Link to="/book-table"><Button variant="primary">Book Now</Button></Link>
                    </div>
                ) : (
                    <div className={styles.booking__list}>
                        {bookings.map((b) => (
                            <div key={b._id} className={styles.booking__listCard}>
                                <div className={styles.booking__listIcon}>🍽️</div>
                                <div className={styles.booking__listInfo}>
                                    <div className={styles.booking__listName}>
                                        {b.restaurant?.name || 'Restaurant'}
                                    </div>
                                    <div className={styles.booking__listMeta}>
                                        📅 {new Date(b.date).toLocaleDateString()} • ⏰ {b.timeSlot} • 👥 {b.guests} guests
                                    </div>
                                    {b.preOrder?.enabled && (
                                        <div className={styles.booking__listMeta}>
                                            🍽️ Pre-order: {b.preOrder.items.length} items — ₹{b.preOrder.totalAmount}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.booking__listRight}>
                                    <span className={`${styles.booking__badge} ${styles[`booking__badge--${b.status}`]}`}>
                                        {b.status.replace(/_/g, ' ')}
                                    </span>
                                    {['pending', 'confirmed'].includes(b.status) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            loading={cancellingId === b._id}
                                            onClick={() => handleCancel(b._id)}
                                            style={{ marginTop: 'var(--space-2)', fontSize: '0.7rem', color: '#ef4444', borderColor: '#ef4444' }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
