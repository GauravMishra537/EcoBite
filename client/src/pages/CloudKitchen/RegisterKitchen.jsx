import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerCloudKitchen } from '../../services/cloudKitchenService';
import { Button, Input } from '../../components';
import toast from 'react-hot-toast';
import styles from './CloudKitchen.module.css';

const RegisterKitchen = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', description: '', phone: '', email: '',
        street: '', city: '', state: '', zipCode: '',
        cuisines: '', deliveryFee: '30', minOrderAmount: '99',
        minTime: '20', maxTime: '40',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.city) {
            toast.error('Name, phone, and city are required');
            return;
        }

        setSubmitting(true);
        try {
            await registerCloudKitchen({
                name: form.name,
                description: form.description,
                phone: form.phone,
                email: form.email,
                cuisines: form.cuisines.split(',').map((c) => c.trim()).filter(Boolean),
                address: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode },
                deliveryFee: Number(form.deliveryFee) || 0,
                minOrderAmount: Number(form.minOrderAmount) || 99,
                deliveryTime: { min: Number(form.minTime) || 20, max: Number(form.maxTime) || 40 },
            });
            toast.success('Cloud kitchen registered! 🎉');
            navigate('/cloud-kitchen/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.ck}>
                <div className="container">
                    <div className={styles.ck__empty}>
                        <p style={{ fontSize: '3rem' }}>🔐</p>
                        <p>Please sign in to register a cloud kitchen</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.ck}>
            <div className="container">
                <div className={styles.ck__regCard}>
                    <div className={styles.ck__regIcon}>☁️🍳</div>
                    <h1 className={styles.ck__regTitle}>Register Your Cloud Kitchen</h1>
                    <p className={styles.ck__regSubtitle}>
                        Start selling food from your home kitchen — no dine-in needed
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.ck__regGrid}>
                            <div className={styles.ck__regFull}>
                                <Input label="Kitchen Name *" name="name" value={form.name} onChange={handleChange} placeholder="My Cloud Kitchen" />
                            </div>
                            <div className={styles.ck__regFull}>
                                <Input label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Home-cooked meals with love..." />
                            </div>
                            <Input label="Phone *" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
                            <Input label="Email" name="email" value={form.email} onChange={handleChange} placeholder="kitchen@example.com" />
                            <div className={styles.ck__regFull}>
                                <Input label="Cuisines (comma-separated)" name="cuisines" value={form.cuisines} onChange={handleChange} placeholder="North Indian, Chinese, South Indian" />
                            </div>
                            <div className={styles.ck__regFull}>
                                <Input label="Street Address" name="street" value={form.street} onChange={handleChange} placeholder="123 Kitchen Lane" />
                            </div>
                            <Input label="City *" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" />
                            <Input label="State" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" />
                            <Input label="Delivery Fee (₹)" name="deliveryFee" type="number" value={form.deliveryFee} onChange={handleChange} />
                            <Input label="Min Order (₹)" name="minOrderAmount" type="number" value={form.minOrderAmount} onChange={handleChange} />
                            <Input label="Min Delivery Time (min)" name="minTime" type="number" value={form.minTime} onChange={handleChange} />
                            <Input label="Max Delivery Time (min)" name="maxTime" type="number" value={form.maxTime} onChange={handleChange} />
                        </div>

                        <Button variant="primary" fullWidth size="lg" loading={submitting} style={{ marginTop: 'var(--space-6)' }}>
                            Register Cloud Kitchen
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterKitchen;
