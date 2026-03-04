import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboard, toggleKitchenStatus, getKitchenOrders, getKitchenMenu, addKitchenMenuItem } from '../../services/cloudKitchenService';
import { Loader, Button, Input } from '../../components';
import toast from 'react-hot-toast';
import styles from './CloudKitchen.module.css';

const KitchenDashboard = () => {
    const { isAuthenticated } = useAuth();
    const [kitchen, setKitchen] = useState(null);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Orders tab
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Menu tab
    const [menuItems, setMenuItems] = useState([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '', price: '', category: '', description: '', isVeg: true,
    });
    const [addingItem, setAddingItem] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        loadDashboard();
    }, [isAuthenticated]);

    useEffect(() => {
        if (activeTab === 'orders' && kitchen) loadOrders();
        if (activeTab === 'menu' && kitchen) loadMenu();
    }, [activeTab, kitchen]);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const data = await getDashboard();
            setKitchen(data.kitchen);
            setStats(data.stats);
        } catch {
            setKitchen(null);
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        setOrdersLoading(true);
        try {
            const data = await getKitchenOrders({ limit: 30 });
            setOrders(data.orders);
        } catch { /* empty */ } finally { setOrdersLoading(false); }
    };

    const loadMenu = async () => {
        setMenuLoading(true);
        try {
            const data = await getKitchenMenu();
            setMenuItems(data.items);
        } catch { /* empty */ } finally { setMenuLoading(false); }
    };

    const handleToggle = async () => {
        try {
            const data = await toggleKitchenStatus();
            setKitchen((p) => ({ ...p, isOpen: data.isOpen }));
            toast.success(data.isOpen ? 'Kitchen is now OPEN' : 'Kitchen is now CLOSED');
        } catch {
            toast.error('Failed to toggle status');
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.price || !newItem.category) {
            toast.error('Name, price, and category are required');
            return;
        }
        setAddingItem(true);
        try {
            const data = await addKitchenMenuItem({
                ...newItem,
                price: Number(newItem.price),
            });
            setMenuItems((p) => [...p, data.item]);
            setNewItem({ name: '', price: '', category: '', description: '', isVeg: true });
            setShowAddForm(false);
            toast.success('Menu item added!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add item');
        } finally {
            setAddingItem(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.ck}>
                <div className="container">
                    <div className={styles.ck__empty}>🔐 Please sign in</div>
                </div>
            </div>
        );
    }

    if (loading) return <Loader fullPage />;

    if (!kitchen) {
        return (
            <div className={styles.ck}>
                <div className="container">
                    <div className={styles.ck__empty}>
                        <p style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>☁️🍳</p>
                        <h2>No Cloud Kitchen Found</h2>
                        <p style={{ marginBottom: 'var(--space-4)' }}>Register your cloud kitchen to get started</p>
                        <Link to="/cloud-kitchen/register">
                            <Button variant="primary">Register Now</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const statusBadgeClass = kitchen.isOpen
        ? styles['ck__statusBadge--open']
        : styles['ck__statusBadge--closed'];

    return (
        <div className={styles.ck}>
            <div className="container">
                {/* Header */}
                <div className={styles.ck__header}>
                    <div className={styles.ck__headerLeft}>
                        <div>
                            <h1 className={styles.ck__kitchenName}>{kitchen.name}</h1>
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                ☁️ Cloud Kitchen • {kitchen.cuisines?.join(', ')}
                            </span>
                        </div>
                    </div>
                    <button
                        className={`${styles.ck__statusBadge} ${statusBadgeClass}`}
                        onClick={handleToggle}
                    >
                        {kitchen.isOpen ? '🟢 Open' : '🔴 Closed'}
                    </button>
                </div>

                {/* Stats */}
                <div className={styles.ck__stats}>
                    <div className={styles.ck__statCard}>
                        <div className={styles.ck__statIcon}>📦</div>
                        <div className={styles.ck__statValue}>{stats.totalOrders}</div>
                        <div className={styles.ck__statLabel}>Total Orders</div>
                    </div>
                    <div className={styles.ck__statCard}>
                        <div className={styles.ck__statIcon}>📊</div>
                        <div className={styles.ck__statValue}>{stats.todayOrders}</div>
                        <div className={styles.ck__statLabel}>Today's Orders</div>
                    </div>
                    <div className={styles.ck__statCard}>
                        <div className={styles.ck__statIcon}>⏳</div>
                        <div className={styles.ck__statValue}>{stats.pendingOrders}</div>
                        <div className={styles.ck__statLabel}>Pending</div>
                    </div>
                    <div className={styles.ck__statCard}>
                        <div className={styles.ck__statIcon}>💰</div>
                        <div className={styles.ck__statValue}>₹{stats.totalRevenue}</div>
                        <div className={styles.ck__statLabel}>Revenue</div>
                    </div>
                    <div className={styles.ck__statCard}>
                        <div className={styles.ck__statIcon}>🍽️</div>
                        <div className={styles.ck__statValue}>{stats.menuItemCount}</div>
                        <div className={styles.ck__statLabel}>Menu Items</div>
                    </div>
                    <div className={styles.ck__statCard}>
                        <div className={styles.ck__statIcon}>⭐</div>
                        <div className={styles.ck__statValue}>{stats.rating?.toFixed(1) || '–'}</div>
                        <div className={styles.ck__statLabel}>Rating</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.ck__tabs}>
                    {['overview', 'orders', 'menu'].map((tab) => (
                        <button
                            key={tab}
                            className={`${styles.ck__tab} ${activeTab === tab ? styles['ck__tab--active'] : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'overview' ? '📊 Overview' : tab === 'orders' ? '📦 Orders' : '🍽️ Menu'}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div>
                        <h3 style={{ marginBottom: 'var(--space-4)' }}>Recent Orders</h3>
                        {stats.totalOrders === 0 ? (
                            <div className={styles.ck__empty}>No orders yet. Share your kitchen link to start receiving orders!</div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>Switch to the Orders tab to manage incoming orders.</p>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        {ordersLoading ? <Loader /> : orders.length === 0 ? (
                            <div className={styles.ck__empty}>No orders found</div>
                        ) : (
                            orders.map((order) => (
                                <div key={order._id} className={styles.ck__orderRow}>
                                    <div className={styles.ck__orderId}>#{order._id.slice(-6).toUpperCase()}</div>
                                    <div className={styles.ck__orderCustomer}>
                                        {order.user?.name || 'Customer'}
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                            {order.items.length} items • {new Date(order.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className={styles.ck__orderTotal}>₹{order.total}</div>
                                    <div className={styles.ck__orderStatus}>
                                        <span style={{
                                            padding: '4px 10px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            borderRadius: '20px',
                                            background: order.status === 'delivered' ? '#d1fae5' : order.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                                            color: order.status === 'delivered' ? '#065f46' : order.status === 'cancelled' ? '#991b1b' : '#92400e',
                                        }}>
                                            {order.status.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <Link to={`/orders/${order._id}`}>
                                        <Button variant="outline" size="sm">View</Button>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <h3>{menuItems.length} Menu Items</h3>
                            <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                                {showAddForm ? 'Cancel' : '+ Add Item'}
                            </Button>
                        </div>

                        {showAddForm && (
                            <form onSubmit={handleAddItem} className={styles.ck__addForm}>
                                <h4 className={styles.ck__addFormTitle}>Add New Item</h4>
                                <div className={styles.ck__addFormGrid}>
                                    <Input label="Name *" name="name" value={newItem.name} onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))} placeholder="Butter Chicken" />
                                    <Input label="Price (₹) *" name="price" type="number" value={newItem.price} onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))} placeholder="299" />
                                    <Input label="Category *" name="category" value={newItem.category} onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))} placeholder="Main Course" />
                                    <Input label="Description" name="description" value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} placeholder="Creamy tomato gravy..." />
                                    <div>
                                        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 4, display: 'block' }}>Type</label>
                                        <select
                                            value={newItem.isVeg ? 'veg' : 'nonveg'}
                                            onChange={(e) => setNewItem((p) => ({ ...p, isVeg: e.target.value === 'veg' }))}
                                            style={{ padding: '10px', borderRadius: 8, border: '2px solid var(--color-gray-200)', width: '100%' }}
                                        >
                                            <option value="veg">🟢 Vegetarian</option>
                                            <option value="nonveg">🔴 Non-Vegetarian</option>
                                        </select>
                                    </div>
                                </div>
                                <Button variant="primary" loading={addingItem} style={{ marginTop: 'var(--space-4)' }}>
                                    Add Item
                                </Button>
                            </form>
                        )}

                        {menuLoading ? <Loader /> : menuItems.length === 0 ? (
                            <div className={styles.ck__empty}>No menu items yet. Add your first item!</div>
                        ) : (
                            <div className={styles.ck__menuGrid}>
                                {menuItems.map((item) => (
                                    <div key={item._id} className={styles.ck__menuCard}>
                                        <div className={`${styles.ck__menuCardVeg} ${item.isVeg ? styles['ck__menuCardVeg--veg'] : styles['ck__menuCardVeg--nonveg']}`}>
                                            <div className={`${styles.ck__menuCardVegDot} ${item.isVeg ? styles['ck__menuCardVegDot--veg'] : styles['ck__menuCardVegDot--nonveg']}`} />
                                        </div>
                                        <div className={styles.ck__menuCardInfo}>
                                            <div className={styles.ck__menuCardName}>{item.name}</div>
                                            <div className={styles.ck__menuCardPrice}>₹{item.price}</div>
                                        </div>
                                        <div className={styles.ck__menuCardCategory}>{item.category}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitchenDashboard;
