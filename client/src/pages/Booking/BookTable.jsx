import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvailableSlots, createBooking } from '../../services/bookingService';
import { getRestaurants } from '../../services/restaurantService';
import { Loader, Button, Input } from '../../components';
import toast from 'react-hot-toast';
import styles from './Booking.module.css';

const BookTable = () => {
    const { isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const preselectedId = searchParams.get('restaurant');

    const [restaurants, setRestaurants] = useState([]);
    const [restaurantId, setRestaurantId] = useState(preselectedId || '');
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [guests, setGuests] = useState(2);
    const [specialRequests, setSpecialRequests] = useState('');
    const [phone, setPhone] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);

    // Load restaurants on mount
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getRestaurants({ limit: 50 });
                // Filter out cloud kitchens
                setRestaurants((data.restaurants || []).filter((r) => !r.isCloudKitchen));
            } catch { /* empty */ }
        };
        load();
    }, []);

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];

    // Load slots when restaurant + date are selected
    useEffect(() => {
        if (!restaurantId || !date) return;
        const loadSlots = async () => {
            setLoadingSlots(true);
            setSelectedSlot('');
            try {
                const data = await getAvailableSlots(restaurantId, date);
                setSlots(data.slots || []);
            } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to load slots');
                setSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };
        loadSlots();
    }, [restaurantId, date]);

    const handleSubmit = async () => {
        if (!restaurantId || !date || !selectedSlot) {
            toast.error('Please select restaurant, date, and time slot');
            return;
        }
        setSubmitting(true);
        try {
            const data = await createBooking({
                restaurantId,
                date,
                timeSlot: selectedSlot,
                guests,
                specialRequests,
                contactPhone: phone,
            });
            setSuccess(data.booking);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Booking failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.booking}>
                <div className="container">
                    <div className={styles.booking__empty}>
                        <div className={styles.booking__emptyIcon}>🔐</div>
                        <h2>Please sign in</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                            Sign in to book a table
                        </p>
                        <Link to="/login"><Button variant="primary">Sign In</Button></Link>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className={styles.booking}>
                <div className="container">
                    <div className={styles.booking__success}>
                        <div className={styles.booking__successIcon}>🎉</div>
                        <h1 className={styles.booking__successTitle}>Table Booked!</h1>
                        <p className={styles.booking__successText}>
                            Your booking at <strong>{success.restaurant?.name}</strong> for{' '}
                            <strong>{success.guests} guests</strong> on{' '}
                            <strong>{new Date(success.date).toLocaleDateString()}</strong> at{' '}
                            <strong>{success.timeSlot}</strong> is {success.status}.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                            <Link to="/bookings"><Button variant="primary">My Bookings</Button></Link>
                            <Button variant="outline" onClick={() => { setSuccess(null); setSelectedSlot(''); }}>Book Another</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.booking}>
            <div className="container">
                <h1 className={styles.booking__title}>Book a Table</h1>
                <p className={styles.booking__subtitle}>Reserve your spot at your favorite restaurant</p>

                <div className={styles.booking__card}>
                    {/* Restaurant */}
                    <div className={styles.booking__section}>
                        <h3 className={styles.booking__sectionTitle}>🍽️ Select Restaurant</h3>
                        <select
                            value={restaurantId}
                            onChange={(e) => setRestaurantId(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: 12, border: '2px solid var(--color-gray-200)', fontSize: '0.95rem' }}
                        >
                            <option value="">Choose a restaurant...</option>
                            {restaurants.map((r) => (
                                <option key={r._id} value={r._id}>{r.name} — {r.cuisines?.join(', ')}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className={styles.booking__section}>
                        <h3 className={styles.booking__sectionTitle}>📅 Select Date</h3>
                        <input
                            type="date"
                            value={date}
                            min={today}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: 12, border: '2px solid var(--color-gray-200)', fontSize: '0.95rem' }}
                        />
                    </div>

                    {/* Time Slots */}
                    {restaurantId && date && (
                        <div className={styles.booking__section}>
                            <h3 className={styles.booking__sectionTitle}>⏰ Select Time</h3>
                            {loadingSlots ? (
                                <Loader />
                            ) : slots.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No slots available</p>
                            ) : (
                                <div className={styles.booking__slots}>
                                    {slots.map((slot) => (
                                        <button
                                            key={slot.time}
                                            className={`${styles.booking__slot} ${selectedSlot === slot.time ? styles['booking__slot--selected'] : ''
                                                } ${!slot.available ? styles['booking__slot--disabled'] : ''}`}
                                            onClick={() => slot.available && setSelectedSlot(slot.time)}
                                            disabled={!slot.available}
                                        >
                                            {slot.time}
                                            <span className={styles.booking__slotRemaining}>
                                                {slot.available ? `${slot.remainingSlots} left` : 'Full'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Guests */}
                    <div className={styles.booking__section}>
                        <h3 className={styles.booking__sectionTitle}>👥 Number of Guests</h3>
                        <div className={styles.booking__guestCounter}>
                            <button
                                className={styles.booking__guestBtn}
                                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                            >
                                −
                            </button>
                            <div>
                                <div className={styles.booking__guestValue}>{guests}</div>
                                <div className={styles.booking__guestLabel}>guests</div>
                            </div>
                            <button
                                className={styles.booking__guestBtn}
                                onClick={() => setGuests((g) => Math.min(20, g + 1))}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className={styles.booking__section}>
                        <Input
                            label="Contact Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 9876543210"
                        />
                    </div>

                    {/* Special Requests */}
                    <div className={styles.booking__section}>
                        <Input
                            label="Special Requests (optional)"
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            placeholder="Window seat, birthday setup, etc."
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        loading={submitting}
                        onClick={handleSubmit}
                        disabled={!restaurantId || !date || !selectedSlot}
                    >
                        Book Table for {guests} {guests === 1 ? 'Guest' : 'Guests'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BookTable;
