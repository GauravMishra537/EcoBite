import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Button from '../Button/Button';
import styles from './Navbar.module.css';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/restaurants', label: 'Restaurants' },
        { to: '/grocery', label: 'Grocery' },
        { to: '/subscription', label: 'Subscription' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

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
                            <span className={styles.navbar__cartBadge}>{totalItems}</span>
                        </button>
                    </Link>

                    {isAuthenticated ? (
                        <div className={styles.navbar__userMenu}>
                            <button className={styles.navbar__userBtn} aria-label="User menu">
                                <HiOutlineUser />
                                <span className={styles.navbar__userName}>
                                    {user?.name?.split(' ')[0]}
                                </span>
                            </button>
                            <div className={styles.navbar__dropdown}>
                                <Link to="/profile" className={styles.navbar__dropdownItem}>
                                    <HiOutlineUser /> My Profile
                                </Link>
                                <Link to="/orders" className={styles.navbar__dropdownItem}>
                                    <HiOutlineShoppingBag /> My Orders
                                </Link>
                                <button
                                    className={styles.navbar__dropdownItem}
                                    onClick={handleLogout}
                                >
                                    <HiOutlineLogout /> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login">
                            <Button variant="primary" size="sm">
                                Sign In
                            </Button>
                        </Link>
                    )}

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
                {isAuthenticated && (
                    <button className={styles.navbar__link} onClick={handleLogout}>
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
