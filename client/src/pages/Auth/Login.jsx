import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components';
import styles from './Auth.module.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const result = await login(formData);
        setLoading(false);

        if (result.success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <div className={styles.auth}>
            <div className={styles.auth__container}>
                <div className={styles.auth__card}>
                    {/* Header */}
                    <div className={styles.auth__header}>
                        <Link to="/" className={styles.auth__logo}>
                            <span className={styles.auth__logoIcon}>🍃</span>
                            <span className={styles.auth__logoText}>EcoBite</span>
                        </Link>
                        <h1 className={styles.auth__title}>Welcome Back</h1>
                        <p className={styles.auth__subtitle}>
                            Sign in to your account to continue ordering
                        </p>
                    </div>

                    {/* Form */}
                    <form className={styles.auth__form} onSubmit={handleSubmit}>
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            icon={HiOutlineMail}
                            error={errors.email}
                            required
                        />

                        <div>
                            <div className={styles.auth__passwordWrapper}>
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    icon={HiOutlineLockClosed}
                                    error={errors.password}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.auth__passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            size="lg"
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className={styles.auth__footer}>
                        Don't have an account?
                        <Link to="/register" className={styles.auth__footerLink}>
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
