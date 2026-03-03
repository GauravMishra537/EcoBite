import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import Button from '../Button/Button';
import styles from './Navbar.module.css';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/restaurants', label: 'Restaurants' },
        { to: '/grocery', label: 'Grocery' },
        { to: '/subscription', label: 'Subscription' },
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbar__container}>
                {/* Logo */}
                <Link to="/" className={styles.navbar__logo}>
                    <span className={styles.navbar__logoIcon}>🍃</span>
                    <span className={styles.navbar__logoText}>EcoBite</span>
                </Link>

                {/* Desktop Nav Links */}
                <div className={styles.navbar__links}>
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `${styles.navbar__link} ${isActive ? styles['navbar__link--active'] : ''}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                {/* Actions */}
                <div className={styles.navbar__actions}>
                    <Link to="/cart">
                        <button className={styles.navbar__cartBtn} aria-label="Cart">
                            <HiOutlineShoppingBag />
                            <span className={styles.navbar__cartBadge}>0</span>
                        </button>
                    </Link>
                    <Link to="/login">
                        <Button variant="primary" size="sm">
                            Sign In
                        </Button>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={styles.navbar__menuBtn}
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`${styles.navbar__mobileMenu} ${mobileOpen ? styles['navbar__mobileMenu--open'] : ''
                    }`}
            >
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={styles.navbar__link}
                        onClick={() => setMobileOpen(false)}
                    >
                        {link.label}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;
