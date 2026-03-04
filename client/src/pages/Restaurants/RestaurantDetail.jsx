import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiStar, HiClock, HiCurrencyRupee, HiLocationMarker } from 'react-icons/hi';
import { Loader } from '../../components';
import { getRestaurant } from '../../services/restaurantService';
import toast from 'react-hot-toast';
import styles from './RestaurantDetail.module.css';

const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('');
    const [vegFilter, setVegFilter] = useState('all'); // all | veg | nonveg
    const categoryRefs = useRef({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getRestaurant(id);
                setRestaurant(data.restaurant);
                setMenu(data.menu || {});
                const categories = Object.keys(data.menu || {});
                if (categories.length > 0) setActiveCategory(categories[0]);
            } catch {
                toast.error('Failed to load restaurant');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const scrollToCategory = (cat) => {
        setActiveCategory(cat);
        categoryRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Apply veg filter
    const getFilteredMenu = () => {
        if (vegFilter === 'all') return menu;
        const filtered = {};
        Object.entries(menu).forEach(([cat, items]) => {
            const filteredItems = items.filter((item) =>
                vegFilter === 'veg' ? item.isVeg : !item.isVeg
            );
            if (filteredItems.length > 0) filtered[cat] = filteredItems;
        });
        return filtered;
    };

    const filteredMenu = getFilteredMenu();
    const categories = Object.keys(filteredMenu);

    if (loading) return <Loader fullPage />;
    if (!restaurant) {
        return (
            <div className={styles.detail}>
                <div className="container">
                    <p>Restaurant not found.</p>
                    <Link to="/restaurants" className={styles.detail__back}>
                        <HiArrowLeft /> Back to Restaurants
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.detail}>
            <div className="container">
                {/* Back */}
                <Link to="/restaurants" className={styles.detail__back}>
                    <HiArrowLeft /> Back to Restaurants
                </Link>

                {/* Hero */}
                <div className={styles.detail__hero}>
                    <img
                        src={restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
                        alt={restaurant.name}
                        className={styles.detail__heroImage}
                    />
                    <div className={styles.detail__heroOverlay} />
                    <div className={styles.detail__heroContent}>
                        <h1 className={styles.detail__heroName}>{restaurant.name}</h1>
                        <p className={styles.detail__heroCuisines}>
                            {restaurant.cuisines?.join(' • ')}
                        </p>
                    </div>
                </div>

                {/* Info Bar */}
                <div className={styles.detail__infoBar}>
                    <span className={styles.detail__ratingBadge}>
                        <HiStar /> {restaurant.rating?.toFixed(1)}
                    </span>
                    <div className={styles.detail__infoItem}>
                        <HiClock className={styles.detail__infoIcon} />
                        <span>
                            <span className={styles.detail__infoValue}>
                                {restaurant.deliveryTime?.min}-{restaurant.deliveryTime?.max}
                            </span>{' '}
                            min
                        </span>
                    </div>
                    <div className={styles.detail__infoItem}>
                        <HiCurrencyRupee className={styles.detail__infoIcon} />
                        <span>
                            <span className={styles.detail__infoValue}>₹{restaurant.deliveryFee}</span> delivery
                        </span>
                    </div>
                    <div className={styles.detail__infoItem}>
                        <HiLocationMarker className={styles.detail__infoIcon} />
                        <span>{restaurant.address?.city}, {restaurant.address?.state}</span>
                    </div>
                    {restaurant.isCloudKitchen && (
                        <span className={styles.detail__infoItem} style={{ color: 'var(--color-accent)' }}>
                            ☁️ Cloud Kitchen
                        </span>
                    )}
                </div>

                {/* Veg/Non-veg Filter */}
                <div className={styles.detail__vegFilter}>
                    <div className={styles.detail__vegToggle}>
                        {['all', 'veg', 'nonveg'].map((f) => (
                            <button
                                key={f}
                                className={`${styles.detail__vegToggleBtn} ${vegFilter === f ? styles['detail__vegToggleBtn--active'] : ''
                                    }`}
                                onClick={() => setVegFilter(f)}
                            >
                                {f === 'all' ? '🍽️ All' : f === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu */}
                {categories.length > 0 ? (
                    <div className={styles.detail__menu}>
                        {/* Category Sidebar */}
                        <div className={styles.detail__categories}>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`${styles.detail__categoryBtn} ${activeCategory === cat ? styles['detail__categoryBtn--active'] : ''
                                        }`}
                                    onClick={() => scrollToCategory(cat)}
                                >
                                    {cat} ({filteredMenu[cat].length})
                                </button>
                            ))}
                        </div>

                        {/* Items */}
                        <div className={styles.detail__menuItems}>
                            {categories.map((cat) => (
                                <div
                                    key={cat}
                                    ref={(el) => (categoryRefs.current[cat] = el)}
                                    className={styles.detail__categorySection}
                                >
                                    <h2 className={styles.detail__categorySectionTitle}>
                                        {cat}
                                        <span className={styles.detail__categoryCount}>
                                            {filteredMenu[cat].length} items
                                        </span>
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        {filteredMenu[cat].map((item) => (
                                            <div key={item._id} className={styles.menuItem}>
                                                <div className={styles.menuItem__info}>
                                                    <div
                                                        className={`${styles.menuItem__vegBadge} ${item.isVeg
                                                                ? styles['menuItem__vegBadge--veg']
                                                                : styles['menuItem__vegBadge--nonveg']
                                                            }`}
                                                    >
                                                        <div
                                                            className={`${styles.menuItem__vegDot} ${item.isVeg
                                                                    ? styles['menuItem__vegDot--veg']
                                                                    : styles['menuItem__vegDot--nonveg']
                                                                }`}
                                                        />
                                                    </div>
                                                    <h3 className={styles.menuItem__name}>{item.name}</h3>
                                                    <p className={styles.menuItem__price}>₹{item.price}</p>
                                                    {item.description && (
                                                        <p className={styles.menuItem__description}>{item.description}</p>
                                                    )}
                                                    <button
                                                        className={styles.menuItem__addBtn}
                                                        onClick={() => toast.success(`${item.name} — cart coming in Commit 8!`)}
                                                    >
                                                        ADD +
                                                    </button>
                                                </div>
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className={styles.menuItem__image}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                        <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📋</p>
                        <h3>No items available</h3>
                        <p style={{ color: 'var(--text-muted)' }}>This restaurant has no menu items yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetail;
