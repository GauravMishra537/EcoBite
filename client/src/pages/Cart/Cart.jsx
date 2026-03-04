import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineTrash, HiPlus, HiMinus, HiCreditCard, HiCash } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { placeOrder } from '../../services/orderService';
import { Button, Input } from '../../components';
import toast from 'react-hot-toast';
import styles from './Cart.module.css';

const CartPage = () => {
    const { cart, totalItems, subtotal, updateItem, removeItem, clearAll } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showCheckout, setShowCheckout] = useState(false);

    if (!isAuthenticated) {
        return (
            <div className={styles.cart}>
                <div className="container">
                    <div className={styles.cart__empty}>
                        <div className={styles.cart__emptyIcon}>🔐</div>
                        <h2 className={styles.cart__emptyTitle}>Please sign in</h2>
                        <p className={styles.cart__emptyText}>You need to be logged in to view your cart</p>
                        <Link to="/login"><Button variant="primary">Sign In</Button></Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className={styles.cart}>
                <div className="container">
                    <div className={styles.cart__empty}>
                        <div className={styles.cart__emptyIcon}>🛒</div>
                        <h2 className={styles.cart__emptyTitle}>Your cart is empty</h2>
                        <p className={styles.cart__emptyText}>Add items from a restaurant to get started</p>
                        <Link to="/restaurants"><Button variant="primary">Browse Restaurants</Button></Link>
                    </div>
                </div>
            </div>
        );
    }

    const deliveryFee = cart.restaurant?.deliveryFee || 0;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + deliveryFee + tax;

    return (
        <div className={styles.cart}>
            <div className="container">
                <h1 className={styles.cart__title}>Your Cart</h1>

                <div className={styles.cart__layout}>
                    {/* Left — Items */}
                    <div>
                        {/* Restaurant Info */}
                        {cart.restaurant && (
                            <div className={styles.cart__restaurant}>
                                <img
                                    src={cart.restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'}
                                    alt={cart.restaurant.name}
                                    className={styles.cart__restaurantImage}
                                />
                                <div>
                                    <div className={styles.cart__restaurantName}>{cart.restaurant.name}</div>
                                    <div className={styles.cart__restaurantMeta}>
                                        {cart.restaurant.deliveryTime?.min}-{cart.restaurant.deliveryTime?.max} min • ₹{cart.restaurant.minOrderAmount} min order
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Items */}
                        <div className={styles.cart__items}>
                            {cart.items.map((item) => (
                                <div key={item._id} className={styles.cart__item}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className={styles.cart__itemImage} />
                                    ) : (
                                        <div className={styles.cart__itemImagePlaceholder}>🍽️</div>
                                    )}
                                    <div className={styles.cart__itemInfo}>
                                        <div className={styles.cart__itemName}>{item.name}</div>
                                        <div className={styles.cart__itemPrice}>₹{item.price}</div>
                                    </div>
                                    <div className={styles.cart__qty}>
                                        <button
                                            className={styles.cart__qtyBtn}
                                            onClick={() =>
                                                item.quantity > 1
                                                    ? updateItem(item._id, item.quantity - 1)
                                                    : removeItem(item._id)
                                            }
                                        >
                                            <HiMinus />
                                        </button>
                                        <span className={styles.cart__qtyValue}>{item.quantity}</span>
                                        <button
                                            className={styles.cart__qtyBtn}
                                            onClick={() => updateItem(item._id, item.quantity + 1)}
                                        >
                                            <HiPlus />
                                        </button>
                                    </div>
                                    <div className={styles.cart__itemTotal}>₹{item.price * item.quantity}</div>
                                    <button
                                        className={styles.cart__itemRemove}
                                        onClick={() => removeItem(item._id)}
                                        aria-label="Remove item"
                                    >
                                        <HiOutlineTrash />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button className={styles.cart__clearBtn} onClick={clearAll}>
                            <HiOutlineTrash /> Clear Cart
                        </button>
                    </div>

                    {/* Right — Summary */}
                    <div className={styles.cart__summary}>
                        <h3 className={styles.cart__summaryTitle}>Order Summary</h3>
                        <div className={styles.cart__summaryRow}>
                            <span>Subtotal ({totalItems} items)</span>
                            <span>₹{subtotal}</span>
                        </div>
                        <div className={styles.cart__summaryRow}>
                            <span>Delivery Fee</span>
                            <span>₹{deliveryFee}</span>
                        </div>
                        <div className={styles.cart__summaryRow}>
                            <span>Tax (5% GST)</span>
                            <span>₹{tax}</span>
                        </div>
                        <div className={`${styles.cart__summaryRow} ${styles['cart__summaryRow--total']}`}>
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>
                        <Button
                            variant="primary"
                            fullWidth
                            size="lg"
                            onClick={() => setShowCheckout(true)}
                            style={{ marginTop: 'var(--space-5)' }}
                        >
                            Proceed to Checkout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckout && (
                <CheckoutModal
                    total={total}
                    subtotal={subtotal}
                    deliveryFee={deliveryFee}
                    tax={tax}
                    onClose={() => setShowCheckout(false)}
                    onSuccess={(orderId) => {
                        setShowCheckout(false);
                        navigate(`/orders/${orderId}`);
                    }}
                />
            )}
        </div>
    );
};

/* ─── Checkout Modal ──────────────────────────────────── */
const CheckoutModal = ({ total, subtotal, deliveryFee, tax, onClose, onSuccess }) => {
    const [address, setAddress] = useState({
        street: '', city: '', state: '', zipCode: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [notes, setNotes] = useState('');
    const [placing, setPlacing] = useState(false);

    const handleAddressChange = (e) => {
        setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePlaceOrder = async () => {
        if (!address.street.trim() || !address.city.trim() || !address.state.trim()) {
            toast.error('Please fill in your delivery address');
            return;
        }

        setPlacing(true);
        try {
            const data = await placeOrder({
                deliveryAddress: address,
                paymentMethod,
                notes,
            });
            toast.success('Order placed successfully! 🎉');
            onSuccess(data.order._id);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    return (
        <div className={styles.checkout__overlay} onClick={onClose}>
            <div className={styles.checkout__modal} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.checkout__title}>Checkout</h2>

                {/* Delivery Address */}
                <div className={styles.checkout__section}>
                    <h3 className={styles.checkout__sectionTitle}>📍 Delivery Address</h3>
                    <div className={styles.checkout__addressGrid}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <Input
                                label="Street Address"
                                name="street"
                                value={address.street}
                                onChange={handleAddressChange}
                                placeholder="123 Main Street, Apt 4B"
                                required
                            />
                        </div>
                        <Input
                            label="City"
                            name="city"
                            value={address.city}
                            onChange={handleAddressChange}
                            placeholder="Mumbai"
                            required
                        />
                        <Input
                            label="State"
                            name="state"
                            value={address.state}
                            onChange={handleAddressChange}
                            placeholder="Maharashtra"
                            required
                        />
                        <Input
                            label="Pin Code"
                            name="zipCode"
                            value={address.zipCode}
                            onChange={handleAddressChange}
                            placeholder="400001"
                        />
                    </div>
                </div>

                {/* Payment */}
                <div className={styles.checkout__section}>
                    <h3 className={styles.checkout__sectionTitle}>💳 Payment Method</h3>
                    <div className={styles.checkout__paymentOptions}>
                        <button
                            className={`${styles.checkout__paymentBtn} ${paymentMethod === 'cod' ? styles['checkout__paymentBtn--active'] : ''}`}
                            onClick={() => setPaymentMethod('cod')}
                        >
                            <span className={styles.checkout__paymentIcon}>💵</span>
                            Cash on Delivery
                        </button>
                        <button
                            className={`${styles.checkout__paymentBtn} ${paymentMethod === 'online' ? styles['checkout__paymentBtn--active'] : ''}`}
                            onClick={() => setPaymentMethod('online')}
                        >
                            <span className={styles.checkout__paymentIcon}>💳</span>
                            Pay Online
                        </button>
                    </div>
                    {paymentMethod === 'online' && (
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                            Stripe payment will be integrated in the next commit.
                        </p>
                    )}
                </div>

                {/* Notes */}
                <div className={styles.checkout__section}>
                    <Input
                        label="Order Notes (optional)"
                        name="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special instructions..."
                        as="textarea"
                    />
                </div>

                {/* Summary */}
                <div className={styles.checkout__section}>
                    <div className={styles.cart__summaryRow}><span>Subtotal</span><span>₹{subtotal}</span></div>
                    <div className={styles.cart__summaryRow}><span>Delivery</span><span>₹{deliveryFee}</span></div>
                    <div className={styles.cart__summaryRow}><span>Tax</span><span>₹{tax}</span></div>
                    <div className={`${styles.cart__summaryRow} ${styles['cart__summaryRow--total']}`}>
                        <span>Total</span><span>₹{total}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.checkout__actions}>
                    <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>
                    <Button variant="primary" fullWidth loading={placing} onClick={handlePlaceOrder}>
                        Place Order — ₹{total}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
