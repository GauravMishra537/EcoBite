import { Link } from 'react-router-dom';
import { Button } from '../../components';
import styles from './Home.module.css';

const features = [
    {
        icon: '🍔',
        color: 'orange',
        title: 'Food Delivery',
        desc: 'Browse hundreds of restaurants and get your favorite meals delivered to your doorstep with real-time tracking.',
    },
    {
        icon: '🛒',
        color: 'green',
        title: 'Grocery Delivery',
        desc: 'Order fresh groceries from multiple stores. Fruits, vegetables, dairy, and more — delivered in minutes.',
    },
    {
        icon: '🏭',
        color: 'purple',
        title: 'Cloud Kitchens',
        desc: 'Discover exclusive cloud kitchen cuisines available only for delivery. Quality food, no dine-in needed.',
    },
    {
        icon: '🪑',
        color: 'blue',
        title: 'Table Booking',
        desc: 'Reserve tables at your favorite restaurants and pre-order meals so food is ready when you arrive.',
    },
    {
        icon: '🤝',
        color: 'pink',
        title: 'NGO Food Sharing',
        desc: 'Restaurants share leftover food with NGOs at minimal cost. Eat well, reduce waste, do good.',
    },
    {
        icon: '💎',
        color: 'cyan',
        title: 'Weekly Subscription',
        desc: 'Subscribe to EcoBite Pass for free delivery on every order. Save more, eat more.',
    },
];

const Home = () => {
    return (
        <div className={styles.home}>
            {/* ═══ Hero Section ═══ */}
            <section className={styles.hero}>
                <div className={styles.hero__container}>
                    <div>
                        <span className={styles.hero__badge}>🚀 #1 Delivery Platform</span>
                        <h1 className={styles.hero__title}>
                            Delicious Food,{' '}
                            <span className={styles.hero__titleHighlight}>Delivered Fast</span>
                        </h1>
                        <p className={styles.hero__subtitle}>
                            Your one-stop platform for food delivery, grocery shopping, table
                            booking, and NGO food sharing. Eat well, live green.
                        </p>
                        <div className={styles.hero__actions}>
                            <Link to="/restaurants">
                                <Button variant="primary" size="lg">
                                    Order Now
                                </Button>
                            </Link>
                            <Link to="/subscription">
                                <Button variant="secondary" size="lg">
                                    View Plans
                                </Button>
                            </Link>
                        </div>
                        <div className={styles.hero__stats}>
                            <div className={styles.hero__stat}>
                                <div className={styles.hero__statNumber}>500+</div>
                                <div className={styles.hero__statLabel}>Restaurants</div>
                            </div>
                            <div className={styles.hero__stat}>
                                <div className={styles.hero__statNumber}>50K+</div>
                                <div className={styles.hero__statLabel}>Happy Users</div>
                            </div>
                            <div className={styles.hero__stat}>
                                <div className={styles.hero__statNumber}>30 min</div>
                                <div className={styles.hero__statLabel}>Avg. Delivery</div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className={styles.hero__visual}>
                        <div className={styles.hero__imageWrapper}>
                            🍕
                            <div className={styles.hero__floatingCard}>
                                ⭐ 4.9 — Top Rated
                            </div>
                            <div className={styles.hero__floatingCard}>
                                🚴 15 min delivery
                            </div>
                            <div className={styles.hero__floatingCard}>
                                🎉 Free delivery!
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Features Section ═══ */}
            <section className={styles.features}>
                <div className={styles.features__header}>
                    <span className={styles.features__pill}>Why EcoBite?</span>
                    <h2 className={styles.features__title}>Everything You Need, One App</h2>
                    <p className={styles.features__subtitle}>
                        From food to groceries, table bookings to social impact — we've got it all.
                    </p>
                </div>
                <div className={styles.features__grid}>
                    {features.map((feature) => (
                        <div key={feature.title} className={styles.featureCard}>
                            <div
                                className={`${styles.featureCard__icon} ${styles[`featureCard__icon--${feature.color}`]
                                    }`}
                            >
                                {feature.icon}
                            </div>
                            <h3 className={styles.featureCard__title}>{feature.title}</h3>
                            <p className={styles.featureCard__desc}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ CTA Section ═══ */}
            <section className={styles.cta}>
                <div className={`container ${styles.cta__container}`}>
                    <h2 className={styles.cta__title}>Ready to Order?</h2>
                    <p className={styles.cta__subtitle}>
                        Create an account and get your first delivery with 20% off.
                    </p>
                    <Link to="/register">
                        <Button variant="secondary" size="lg">
                            Get Started — It's Free
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
