import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAvailableListings, claimServings, getImpactStats } from '../../services/foodSharingService';
import { Loader, Button, Input } from '../../components';
import toast from 'react-hot-toast';
import styles from './FoodSharing.module.css';

const CATEGORIES = [
    { id: '', label: 'All', icon: '🍱' },
    { id: 'leftover', label: 'Leftover', icon: '🥘' },
    { id: 'surplus', label: 'Surplus', icon: '📦' },
    { id: 'near_expiry', label: 'Near Expiry', icon: '⏰' },
    { id: 'donation', label: 'Donation', icon: '💚' },
];

const FoodSharingPage = () => {
    const { isAuthenticated } = useAuth();
    const [listings, setListings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');

    // Claim modal state
    const [claimModal, setClaimModal] = useState(null);
    const [claimServingsCount, setClaimServingsCount] = useState(1);
    const [claimNgo, setClaimNgo] = useState('');
    const [claiming, setClaiming] = useState(false);

    useEffect(() => {
        loadData();
    }, [category]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [listingData, statsData] = await Promise.all([
                getAvailableListings({ category: category || undefined }),
                getImpactStats(),
            ]);
            setListings(listingData.listings || []);
            setStats(statsData.stats || null);
        } catch { /* empty */ } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to claim food');
            return;
        }
        setClaiming(true);
        try {
            await claimServings(claimModal._id, claimServingsCount, claimNgo);
            toast.success(`Claimed ${claimServingsCount} serving(s)! 🎉`);
            setClaimModal(null);
            setClaimServingsCount(1);
            setClaimNgo('');
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Claim failed');
        } finally {
            setClaiming(false);
        }
    };

    const timeUntilExpiry = (expiresAt) => {
        const diff = new Date(expiresAt) - new Date();
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        if (hours > 0) return `${hours}h ${mins}m left`;
        return `${mins}m left`;
    };

    return (
        <div className={styles.fs}>
            <div className="container">
                {/* Hero */}
                <div className={styles.fs__hero}>
                    <div className={styles.fs__heroIcon}>🤝</div>
                    <h1 className={styles.fs__heroTitle}>Share Food, Spread Love</h1>
                    <p className={styles.fs__heroText}>
                        Restaurants share surplus food at nominal cost. Reduce waste, feed communities,
                        and make a real difference — one meal at a time.
                    </p>
                </div>

                {/* Impact Stats */}
                {stats && (
                    <div className={styles.fs__stats}>
                        <div className={styles.fs__stat}>
                            <div className={styles.fs__statIcon}>📋</div>
                            <div className={styles.fs__statValue}>{stats.totalListings}</div>
                            <div className={styles.fs__statLabel}>Listings</div>
                        </div>
                        <div className={styles.fs__stat}>
                            <div className={styles.fs__statIcon}>🍽️</div>
                            <div className={styles.fs__statValue}>{stats.totalServingsListed}</div>
                            <div className={styles.fs__statLabel}>Servings Listed</div>
                        </div>
                        <div className={styles.fs__stat}>
                            <div className={styles.fs__statIcon}>🤝</div>
                            <div className={styles.fs__statValue}>{stats.totalServingsClaimed}</div>
                            <div className={styles.fs__statLabel}>Servings Claimed</div>
                        </div>
                        <div className={styles.fs__stat}>
                            <div className={styles.fs__statIcon}>🏪</div>
                            <div className={styles.fs__statValue}>{stats.totalRestaurants}</div>
                            <div className={styles.fs__statLabel}>Restaurants</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className={styles.fs__filters}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            className={`${styles.fs__filterBtn} ${category === cat.id ? styles['fs__filterBtn--active'] : ''}`}
                            onClick={() => setCategory(cat.id)}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                {/* Listings */}
                {loading ? (
                    <Loader />
                ) : listings.length === 0 ? (
                    <div className={styles.fs__empty}>
                        <div className={styles.fs__emptyIcon}>🍲</div>
                        <h2>No food listings available</h2>
                        <p>Check back soon — restaurants regularly share surplus food!</p>
                    </div>
                ) : (
                    <div className={styles.fs__grid}>
                        {listings.map((listing) => {
                            const claimedPercent = ((listing.totalServings - listing.remainingServings) / listing.totalServings) * 100;
                            return (
                                <div key={listing._id} className={styles.fs__card}>
                                    <div className={styles.fs__cardHeader}>
                                        <div>
                                            <div className={styles.fs__cardTitle}>{listing.title}</div>
                                            <div className={styles.fs__cardRestaurant}>
                                                🏪 {listing.restaurant?.name || 'Restaurant'}
                                            </div>
                                        </div>
                                        <span className={`${styles.fs__cardBadge} ${styles[`fs__cardBadge--${listing.category}`]}`}>
                                            {listing.category.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    <div className={styles.fs__cardBody}>
                                        {listing.description && (
                                            <div className={styles.fs__cardDesc}>{listing.description}</div>
                                        )}

                                        {/* Servings progress */}
                                        <div className={styles.fs__servingsBar}>
                                            <div
                                                className={styles.fs__servingsBarFill}
                                                style={{ width: `${claimedPercent}%` }}
                                            />
                                        </div>
                                        <div className={styles.fs__servingsText}>
                                            {listing.remainingServings} of {listing.totalServings} servings remaining
                                        </div>

                                        <div className={styles.fs__cardMeta}>
                                            <div className={styles.fs__cardMetaItem}>
                                                ⏰ {timeUntilExpiry(listing.expiresAt)}
                                            </div>
                                            {listing.items?.length > 0 && (
                                                <div className={styles.fs__cardMetaItem}>
                                                    🍱 {listing.items.map((i) => i.name).join(', ')}
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.fs__cardFooter}>
                                            <div className={styles.fs__cardCost}>
                                                ₹{listing.nominalCost}
                                                <span className={styles.fs__cardCostLabel}> /serving</span>
                                            </div>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => setClaimModal(listing)}
                                                disabled={listing.remainingServings <= 0}
                                            >
                                                Claim Food
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Claim Modal */}
                {claimModal && (
                    <div className={styles.fs__modal}>
                        <div className={styles.fs__modalOverlay} onClick={() => setClaimModal(null)} />
                        <div className={styles.fs__modalContent}>
                            <button className={styles.fs__modalClose} onClick={() => setClaimModal(null)}>✕</button>
                            <h2 className={styles.fs__modalTitle}>🍽️ Claim Food</h2>

                            <p style={{ marginBottom: 'var(--space-2)', fontWeight: 600 }}>{claimModal.title}</p>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                                {claimModal.remainingServings} servings available • ₹{claimModal.nominalCost}/serving
                            </p>

                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <Input
                                    label="Number of Servings"
                                    type="number"
                                    value={claimServingsCount}
                                    onChange={(e) => setClaimServingsCount(Math.min(claimModal.remainingServings, Math.max(1, parseInt(e.target.value) || 1)))}
                                    min={1}
                                    max={claimModal.remainingServings}
                                />
                            </div>

                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <Input
                                    label="NGO / Organization Name (optional)"
                                    value={claimNgo}
                                    onChange={(e) => setClaimNgo(e.target.value)}
                                    placeholder="e.g. Feeding Hope Foundation"
                                />
                            </div>

                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                                Total: <strong>₹{claimServingsCount * claimModal.nominalCost}</strong>
                            </p>

                            <Button
                                variant="primary"
                                fullWidth
                                loading={claiming}
                                onClick={handleClaim}
                            >
                                Confirm Claim — ₹{claimServingsCount * claimModal.nominalCost}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodSharingPage;
