import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer__grid}>
                {/* Brand */}
                <div className={styles.footer__brand}>
                    <Link to="/" className={styles.footer__logo}>
                        <span className={styles.footer__logoIcon}>🍃</span>
                        <span className={styles.footer__logoText}>EcoBite</span>
                    </Link>
                    <p className={styles.footer__desc}>
                        Your one-stop platform for food delivery, grocery shopping, table
                        booking, and more. Eat well, live green.
                    </p>
                </div>

                {/* Quick Links */}
                <div className={styles.footer__column}>
                    <h4 className={styles.footer__heading}>Explore</h4>
                    <Link to="/restaurants" className={styles.footer__link}>Restaurants</Link>
                    <Link to="/grocery" className={styles.footer__link}>Grocery</Link>
                    <Link to="/subscription" className={styles.footer__link}>Subscription</Link>
                    <Link to="/ngo" className={styles.footer__link}>NGO Food Share</Link>
                </div>

                {/* Company */}
                <div className={styles.footer__column}>
                    <h4 className={styles.footer__heading}>Company</h4>
                    <Link to="/about" className={styles.footer__link}>About Us</Link>
                    <Link to="/contact" className={styles.footer__link}>Contact</Link>
                    <Link to="/careers" className={styles.footer__link}>Careers</Link>
                    <Link to="/blog" className={styles.footer__link}>Blog</Link>
                </div>

                {/* Legal */}
                <div className={styles.footer__column}>
                    <h4 className={styles.footer__heading}>Legal</h4>
                    <Link to="/terms" className={styles.footer__link}>Terms of Service</Link>
                    <Link to="/privacy" className={styles.footer__link}>Privacy Policy</Link>
                    <Link to="/refund" className={styles.footer__link}>Refund Policy</Link>
                </div>
            </div>

            {/* Bottom */}
            <div className={styles.footer__bottom}>
                <p>&copy; {new Date().getFullYear()} EcoBite. All rights reserved.</p>
                <div className={styles.footer__socials}>
                    <a href="#" className={styles.footer__socialLink} aria-label="Twitter">𝕏</a>
                    <a href="#" className={styles.footer__socialLink} aria-label="Instagram">📷</a>
                    <a href="#" className={styles.footer__socialLink} aria-label="LinkedIn">💼</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
