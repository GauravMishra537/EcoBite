import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPlans, subscribe, getMySubscription, cancelSubscription } from '../../services/subscriptionService';
import { Loader, Button } from '../../components';
import toast from 'react-hot-toast';
import styles from './Subscription.module.css';

const PLAN_FEATURES = {
    weekly: [
        { icon: '🚚', text: 'Free delivery on all orders' },
        { icon: '📱', text: 'Priority order tracking' },
        { icon: '🎯', text: 'Perfect for trying out' },
    ],
    monthly: [
        { icon: '🚚', text: 'Free delivery on all orders' },
        { icon: '💰', text: '5% discount on subtotal' },
        { icon: '📱', text: 'Priority order tracking' },
        { icon: '🔄', text: 'Best value for regulars' },
    ],
    quarterly: [
        { icon: '🚚', text: 'Free delivery on all orders' },
        { icon: '💰', text: '10% discount on subtotal' },
        { icon: '🎧', text: 'Priority customer support' },
        { icon: '📱', text: 'Priority order tracking' },
        { icon: '⭐', text: 'Maximum savings' },
    ],
};

const SubscriptionPage = () => {
    const { isAuthenticated } = useAuth();
    const [plans, setPlans] = useState([]);
    const [activeSub, setActiveSub] = useState(null);
    const [hasSub, setHasSub] = useState(false);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadData();
    }, [isAuthenticated]);

    const loadData = async () => {
        setLoading(true);
        try {
            const plansData = await getPlans();
            setPlans(plansData.plans || []);

            if (isAuthenticated) {
                const subData = await getMySubscription();
                setHasSub(subData.hasSubscription);
                setActiveSub(subData.subscription);
            }
        } catch { /* empty */ } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId) => {
        if (!isAuthenticated) {
            toast.error('Please sign in to subscribe');
            return;
        }
        setSubscribing(planId);
        try {
            await subscribe(planId);
            toast.success('Subscribed successfully! 🎉');
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to subscribe');
        } finally {
            setSubscribing('');
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
        setCancelling(true);
        try {
            await cancelSubscription('User cancelled from dashboard');
            toast.success('Subscription cancelled');
            setActiveSub(null);
            setHasSub(false);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to cancel');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <Loader fullPage />;

    return (
        <div className={styles.sub}>
            <div className="container">
                {/* Hero */}
                <div className={styles.sub__hero}>
                    <div className={styles.sub__heroIcon}>💎</div>
                    <h1 className={styles.sub__heroTitle}>EcoBite Premium</h1>
                    <p className={styles.sub__heroText}>
                        Save on every order with free delivery, exclusive discounts, and priority support
                    </p>
                </div>

                {/* Active Subscription */}
                {hasSub && activeSub && (
                    <div className={styles.sub__active}>
                        <div className={styles.sub__activeIcon}>✅</div>
                        <h2 className={styles.sub__activeTitle}>You're a Premium Member!</h2>
                        <div className={styles.sub__activePlan}>
                            {activeSub.plan} plan
                        </div>

                        <div className={styles.sub__activeInfo}>
                            <div className={styles.sub__activeInfoItem}>
                                <div className={styles.sub__activeInfoLabel}>Started</div>
                                <div className={styles.sub__activeInfoValue}>
                                    {new Date(activeSub.startDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div className={styles.sub__activeInfoItem}>
                                <div className={styles.sub__activeInfoLabel}>Expires</div>
                                <div className={styles.sub__activeInfoValue}>
                                    {new Date(activeSub.endDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div className={styles.sub__activeInfoItem}>
                                <div className={styles.sub__activeInfoLabel}>Days Left</div>
                                <div className={styles.sub__activeInfoValue}>
                                    {Math.max(0, Math.ceil((new Date(activeSub.endDate) - new Date()) / (1000 * 60 * 60 * 24)))}
                                </div>
                            </div>
                            <div className={styles.sub__activeInfoItem}>
                                <div className={styles.sub__activeInfoLabel}>Paid</div>
                                <div className={styles.sub__activeInfoValue}>₹{activeSub.price}</div>
                            </div>
                        </div>

                        <div className={styles.sub__activeBenefits}>
                            {activeSub.benefits?.freeDelivery && (
                                <span className={styles.sub__activeBenefit}>🚚 Free Delivery</span>
                            )}
                            {activeSub.benefits?.discountPercent > 0 && (
                                <span className={styles.sub__activeBenefit}>💰 {activeSub.benefits.discountPercent}% Off</span>
                            )}
                            {activeSub.benefits?.prioritySupport && (
                                <span className={styles.sub__activeBenefit}>🎧 Priority Support</span>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            loading={cancelling}
                            onClick={handleCancel}
                            style={{ color: '#ef4444', borderColor: '#ef4444' }}
                        >
                            Cancel Subscription
                        </Button>
                    </div>
                )}

                {/* Plan Cards */}
                {!hasSub && (
                    <div className={styles.sub__plans}>
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`${styles.sub__plan} ${plan.id === 'monthly' ? styles['sub__plan--popular'] : ''}`}
                            >
                                {plan.id === 'monthly' && (
                                    <div className={styles.sub__planBadge}>Most Popular</div>
                                )}
                                <h3 className={styles.sub__planName}>{plan.name}</h3>
                                <div className={styles.sub__planPrice}>₹{plan.price}</div>
                                <div className={styles.sub__planDuration}>{plan.durationDays} days</div>

                                <ul className={styles.sub__planFeatures}>
                                    {(PLAN_FEATURES[plan.id] || []).map((f, i) => (
                                        <li key={i} className={styles.sub__planFeature}>
                                            <span className={styles.sub__planFeatureIcon}>{f.icon}</span>
                                            {f.text}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    variant={plan.id === 'monthly' ? 'primary' : 'outline'}
                                    fullWidth
                                    loading={subscribing === plan.id}
                                    onClick={() => handleSubscribe(plan.id)}
                                >
                                    Subscribe — ₹{plan.price}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Not signed in */}
                {!isAuthenticated && (
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                            Sign in to subscribe and start saving
                        </p>
                        <Link to="/login"><Button variant="primary">Sign In</Button></Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionPage;
