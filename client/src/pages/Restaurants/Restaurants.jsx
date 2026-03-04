import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSearch, HiStar } from 'react-icons/hi';
import { Loader } from '../../components';
import { getRestaurants } from '../../services/restaurantService';
import styles from './Restaurants.module.css';

const cuisineFilters = [
    'All', 'North Indian', 'Chinese', 'Italian', 'Biryani',
    'Healthy', 'Fast Food', 'South Indian', 'Pizza',
];

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [sortBy, setSortBy] = useState('rating');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchRestaurants = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 12,
                sortBy,
            };
            if (search.trim()) params.search = search.trim();
            if (selectedCuisine !== 'All') params.cuisine = selectedCuisine;

            const data = await getRestaurants(params);
            setRestaurants(data.restaurants);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch {
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortBy, search, selectedCuisine]);

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const handleCuisineFilter = (cuisine) => {
        setSelectedCuisine(cuisine);
        setCurrentPage(1);
    };

    return (
        <div className={styles.restaurants}>
            <div className="container">
                {/* Header */}
                <div className={styles.restaurants__header}>
                    <h1 className={styles.restaurants__title}>Restaurants Near You</h1>
                    <p className={styles.restaurants__subtitle}>
                        {total > 0 ? `${total} restaurants available` : 'Discover delicious food'}
                    </p>
                </div>

                {/* Search */}
                <div className={styles.restaurants__searchBar}>
                    <div className={styles.restaurants__searchInput}>
                        <HiOutlineSearch className={styles.restaurants__searchIcon} />
                        <input
                            type="text"
                            className={styles.restaurants__searchField}
                            placeholder="Search restaurants, cuisines, or dishes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className={styles.restaurants__filters}>
                    {cuisineFilters.map((cuisine) => (
                        <button
                            key={cuisine}
                            className={`${styles.restaurants__filterChip} ${selectedCuisine === cuisine ? styles['restaurants__filterChip--active'] : ''
                                }`}
                            onClick={() => handleCuisineFilter(cuisine)}
                        >
                            {cuisine}
                        </button>
                    ))}
                    <select
                        className={styles.restaurants__sortSelect}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="rating">Top Rated</option>
                        <option value="deliveryTime">Fastest Delivery</option>
                        <option value="name">Name A-Z</option>
                        <option value="newest">Newest</option>
                    </select>
                </div>

                {/* Loading */}
                {loading ? (
                    <Loader fullPage />
                ) : (
                    <>
                        {/* Grid */}
                        <div className={styles.restaurants__grid}>
                            {restaurants.length > 0 ? (
                                restaurants.map((restaurant) => (
                                    <Link
                                        to={`/restaurants/${restaurant._id}`}
                                        key={restaurant._id}
                                        className={styles.restaurantCard}
                                    >
                                        <div className={styles.restaurantCard__imageWrapper}>
                                            <img
                                                src={restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
                                                alt={restaurant.name}
                                                className={styles.restaurantCard__image}
                                            />
                                            <div className={styles.restaurantCard__badges}>
                                                {restaurant.isCloudKitchen && (
                                                    <span className={`${styles.restaurantCard__badge} ${styles['restaurantCard__badge--cloud']}`}>
                                                        ☁️ Cloud Kitchen
                                                    </span>
                                                )}
                                            </div>
                                            <span className={styles.restaurantCard__deliveryTime}>
                                                {restaurant.deliveryTime?.min}-{restaurant.deliveryTime?.max} min
                                            </span>
                                        </div>
                                        <div className={styles.restaurantCard__body}>
                                            <div className={styles.restaurantCard__row}>
                                                <h3 className={styles.restaurantCard__name}>{restaurant.name}</h3>
                                                <span className={styles.restaurantCard__rating}>
                                                    <HiStar /> {restaurant.rating?.toFixed(1)}
                                                </span>
                                            </div>
                                            <p className={styles.restaurantCard__cuisines}>
                                                {restaurant.cuisines?.join(' • ')}
                                            </p>
                                            <div className={styles.restaurantCard__footer}>
                                                <span>₹{restaurant.minOrderAmount} min order</span>
                                                <span>₹{restaurant.deliveryFee} delivery</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className={styles.restaurants__empty}>
                                    <div className={styles.restaurants__emptyIcon}>🍽️</div>
                                    <h3 className={styles.restaurants__emptyTitle}>No restaurants found</h3>
                                    <p className={styles.restaurants__emptyText}>
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.restaurants__pagination}>
                                <button
                                    className={styles.restaurants__pageBtn}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`${styles.restaurants__pageBtn} ${currentPage === i + 1 ? styles['restaurants__pageBtn--active'] : ''
                                            }`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className={styles.restaurants__pageBtn}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Restaurants;
