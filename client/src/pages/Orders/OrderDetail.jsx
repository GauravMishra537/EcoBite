import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { HiArrowLeft, HiCheck } from 'react-icons/hi';
import { Loader, Button } from '../../components';
import { getOrder, cancelOrder } from '../../services/orderService';
import toast from 'react-hot-toast';
import styles from './Orders.module.css';

const STATUS_STEPS = [
    { key: 'placed', label: 'Placed', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'ready', label: 'Ready', icon: '📦' },
    { key: 'out_for_delivery', label: 'On the way', icon: '🚴' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

const OrderDetail = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isNew = searchParams.get('new') === '1';
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const data = await getOrder(id);
                setOrder(data.order);
            } catch {
                toast.error('Failed to load order');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        setCancelling(true);
        try {
            const data = await cancelOrder(id, 'Changed my mind');
            setOrder(data.order);
            toast.success('Order cancelled');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Cannot cancel order');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <Loader fullPage />;
    if (!order) {
        return (
            <div className={styles.orderDetail}>
                <div className="container">
                    <p>Order not found.</p>
                    <Link to="/orders" className={styles.orderDetail__back}>
                        <HiArrowLeft /> Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className={styles.orderDetail}>
            <div className="container">
                <Link to="/orders" className={styles.orderDetail__back}>
                    <HiArrowLeft /> Back to Orders
                </Link>

                {/* Success banner for new orders */}
                {isNew && !isCancelled && (
                    <div className={styles.orderDetail__success}>
                        <div className={styles.orderDetail__successIcon}>🎉</div>
                        <h2 className={styles.orderDetail__successTitle}>Order Placed Successfully!</h2>
                        <p className={styles.orderDetail__successText}>
                            Your order #{order._id.slice(-8).toUpperCase()} has been placed.
                            {order.paymentMethod === 'online' && ' Payment received.'}
                        </p>
                    </div>
                )}

                <div className={styles.orderDetail__layout}>
                    {/* Left */}
                    <div>
                        {/* Status Tracker */}
                        {!isCancelled ? (
                            <div className={styles.orderDetail__tracker}>
                                <h3 className={styles.orderDetail__trackerTitle}>Order Status</h3>
                                <div className={styles.orderDetail__steps}>
                                    {STATUS_STEPS.map((step, i) => (
                                        <div key={step.key} className={styles.orderDetail__step}>
                                            {i < STATUS_STEPS.length - 1 && (
                                                <div
                                                    className={`${styles.orderDetail__stepLine} ${i < currentStepIndex ? styles['orderDetail__stepLine--done'] : ''
                                                        }`}
                                                />
                                            )}
                                            <div
                                                className={`${styles.orderDetail__stepDot} ${i < currentStepIndex
                                                        ? styles['orderDetail__stepDot--done']
                                                        : i === currentStepIndex
                                                            ? styles['orderDetail__stepDot--active']
                                                            : ''
                                                    }`}
                                            >
                                                {i < currentStepIndex ? <HiCheck /> : step.icon}
                                            </div>
                                            <span
                                                className={`${styles.orderDetail__stepLabel} ${i === currentStepIndex ? styles['orderDetail__stepLabel--active'] : ''
                                                    }`}
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.orderDetail__tracker}>
                                <h3 className={styles.orderDetail__trackerTitle}>Order Cancelled</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                    {order.cancelReason || 'This order was cancelled'}
                                    {order.cancelledAt && ` on ${new Date(order.cancelledAt).toLocaleString()}`}
                                </p>
                            </div>
                        )}

                        {/* Items */}
                        <div className={styles.orderDetail__items}>
                            <h3 className={styles.orderDetail__itemsTitle}>
                                Items ({order.items.length})
                            </h3>
                            {order.items.map((item, i) => (
                                <div key={i} className={styles.orderDetail__item}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className={styles.orderDetail__itemImage} />
                                    ) : (
                                        <div className={styles.orderDetail__itemImagePlaceholder}>🍽️</div>
                                    )}
                                    <div className={styles.orderDetail__itemInfo}>
                                        <div className={styles.orderDetail__itemName}>{item.name}</div>
                                        <div className={styles.orderDetail__itemQty}>Qty: {item.quantity}</div>
                                    </div>
                                    <div className={styles.orderDetail__itemPrice}>
                                        ₹{item.price * item.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side Panel */}
                    <div className={styles.orderDetail__side}>
                        {/* Price Breakdown */}
                        <div className={styles.orderDetail__card}>
                            <h4 className={styles.orderDetail__cardTitle}>Payment Summary</h4>
                            <div className={styles.orderDetail__row}>
                                <span>Subtotal</span><span>₹{order.subtotal}</span>
                            </div>
                            <div className={styles.orderDetail__row}>
                                <span>Delivery Fee</span><span>₹{order.deliveryFee}</span>
                            </div>
                            <div className={styles.orderDetail__row}>
                                <span>Tax</span><span>₹{order.tax}</span>
                            </div>
                            <div className={`${styles.orderDetail__row} ${styles['orderDetail__row--total']}`}>
                                <span>Total</span><span>₹{order.total}</span>
                            </div>
                            <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                <span className={`${styles.orderDetail__badge} ${styles[`orderDetail__badge--${order.paymentMethod === 'cod' ? 'placed' : 'confirmed'}`]}`}>
                                    {order.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}
                                </span>
                                <span className={`${styles.orderDetail__badge} ${styles[`orderDetail__badge--${order.paymentStatus}`]}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className={styles.orderDetail__card}>
                            <h4 className={styles.orderDetail__cardTitle}>📍 Delivery Address</h4>
                            <div className={styles.orderDetail__addressText}>
                                {order.deliveryAddress?.street}<br />
                                {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
                                {order.deliveryAddress?.zipCode && ` - ${order.deliveryAddress.zipCode}`}
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className={styles.orderDetail__card}>
                            <h4 className={styles.orderDetail__cardTitle}>Order Info</h4>
                            <div className={styles.orderDetail__row}>
                                <span>Order ID</span>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                    #{order._id.slice(-8).toUpperCase()}
                                </span>
                            </div>
                            <div className={styles.orderDetail__row}>
                                <span>Placed</span>
                                <span>{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                            {order.estimatedDelivery && !isCancelled && order.status !== 'delivered' && (
                                <div className={styles.orderDetail__row}>
                                    <span>Est. Delivery</span>
                                    <span>{new Date(order.estimatedDelivery).toLocaleTimeString()}</span>
                                </div>
                            )}
                            {order.restaurant && (
                                <div className={styles.orderDetail__row}>
                                    <span>Restaurant</span>
                                    <span>{order.restaurant.name || 'N/A'}</span>
                                </div>
                            )}
                        </div>

                        {/* Cancel Button */}
                        {['placed', 'confirmed'].includes(order.status) && (
                            <Button
                                variant="outline"
                                fullWidth
                                loading={cancelling}
                                onClick={handleCancel}
                                style={{ color: '#ef4444', borderColor: '#ef4444' }}
                            >
                                Cancel Order
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
