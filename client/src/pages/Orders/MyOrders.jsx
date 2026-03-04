import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Button } from '../../components';
import { getMyOrders } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import styles from './Orders.module.css';

const statusFilters = [
    { key: '', label: 'All' },
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
];

const MyOrders = () => {
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const params = { limit: 50 };
                if (statusFilter) params.status = statusFilter;
                const data = await getMyOrders(params);
                setOrders(data.orders);
                setTotalOrders(data.total);
            } catch {
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [isAuthenticated, statusFilter]);

    if (!isAuthenticated) {
        return (
            <div className={styles.orders}>
                <div className="container">
                    <div className={styles.orders__empty}>
                        <div className={styles.orders__emptyIcon}>🔐</div>
                        <h2>Please sign in</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                            Sign in to view your order history
                        </p>
                        <Link to="/login"><Button variant="primary">Sign In</Button></Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.orders}>
            <div className="container">
                <h1 className={styles.orders__title}>My Orders</h1>
                <p className={styles.orders__subtitle}>
                    {totalOrders > 0 ? `${totalOrders} orders` : 'Your order history will appear here'}
                </p>

                {/* Status Filters */}
                <div className={styles.orders__filters}>
                    {statusFilters.map((f) => (
                        <button
                            key={f.key}
                            className={`${styles.orders__filterBtn} ${statusFilter === f.key ? styles['orders__filterBtn--active'] : ''
                                }`}
                            onClick={() => setStatusFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <Loader />
                ) : orders.length > 0 ? (
                    <div className={styles.orders__list}>
                        {orders.map((order) => (
                            <Link
                                to={`/orders/${order._id}`}
                                key={order._id}
                                className={styles.orders__card}
                            >
                                <img
                                    src={order.restaurant?.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'}
                                    alt={order.restaurant?.name || 'Restaurant'}
                                    className={styles.orders__cardImage}
                                />
                                <div className={styles.orders__cardInfo}>
                                    <div className={styles.orders__cardName}>
                                        {order.restaurant?.name || 'Restaurant'}
                                    </div>
                                    <div className={styles.orders__cardMeta}>
                                        {order.items.length} items • {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className={styles.orders__cardMeta}>
                                        #{order._id.slice(-8).toUpperCase()}
                                    </div>
                                </div>
                                <div className={styles.orders__cardRight}>
                                    <div className={styles.orders__cardTotal}>₹{order.total}</div>
                                    <span
                                        className={`${styles.orderDetail__badge} ${styles[`orderDetail__badge--${order.status}`]
                                            }`}
                                    >
                                        {order.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={styles.orders__empty}>
                        <div className={styles.orders__emptyIcon}>📦</div>
                        <h2>No orders found</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                            {statusFilter ? 'No orders match this filter' : 'You haven\'t placed any orders yet'}
                        </p>
                        <Link to="/restaurants"><Button variant="primary">Browse Restaurants</Button></Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
