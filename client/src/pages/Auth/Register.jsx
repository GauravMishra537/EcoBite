import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    HiOutlineMail,
    HiOutlineLockClosed,
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineEye,
    HiOutlineEyeOff,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components';
import styles from './Auth.module.css';

const roles = [
    { value: 'customer', label: 'Customer', icon: '🛒' },
    { value: 'restaurant', label: 'Restaurant', icon: '🏪' },
    { value: 'ngo', label: 'NGO', icon: '🤝' },
];

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const { confirmPassword, ...registerData } = formData;
        const result = await register(registerData);
        setLoading(false);

        if (result.success) {
            navigate('/');
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
                        <h1 className={styles.auth__title}>Create Account</h1>
                        <p className={styles.auth__subtitle}>
                            Join EcoBite and start ordering delicious food
                        </p>
                    </div>

                    {/* Form */}
                    <form className={styles.auth__form} onSubmit={handleSubmit}>
                        {/* Role Selector */}
                        <div>
                            <label
                                style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    marginBottom: 'var(--space-2)',
                                    display: 'block',
                                }}
                            >
                                I am a
                            </label>
                            <div className={styles.auth__roles}>
                                {roles.map((role) => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        className={`${styles.auth__roleBtn} ${formData.role === role.value
                                                ? styles['auth__roleBtn--active']
                                                : ''
                                            }`}
                                        onClick={() =>
                                            setFormData((prev) => ({ ...prev, role: role.value }))
                                        }
                                    >
                                        <span className={styles.auth__roleIcon}>{role.icon}</span>
                                        {role.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input
                            label="Full Name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            icon={HiOutlineUser}
                            error={errors.name}
                            required
                        />

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

                        <Input
                            label="Phone Number"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 9876543210"
                            icon={HiOutlinePhone}
                        />

                        <div className={styles.auth__passwordWrapper}>
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 6 characters"
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

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            icon={HiOutlineLockClosed}
                            error={errors.confirmPassword}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            size="lg"
                        >
                            Create Account
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className={styles.auth__footer}>
                        Already have an account?
                        <Link to="/login" className={styles.auth__footerLink}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
