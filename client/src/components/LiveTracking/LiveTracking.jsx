import { useState, useEffect, useMemo } from 'react';
import styles from './LiveTracking.module.css';

const STATUS_PROGRESS = {
    placed: 0,
    confirmed: 10,
    preparing: 25,
    ready: 50,
    out_for_delivery: 75,
    delivered: 100,
};

const STATUS_MESSAGES = {
    placed: { text: 'Order placed', emoji: '📝' },
    confirmed: { text: 'Restaurant confirmed', emoji: '✅' },
    preparing: { text: 'Being prepared', emoji: '👨‍🍳' },
    ready: { text: 'Ready for pickup', emoji: '📦' },
    out_for_delivery: { text: 'On the way!', emoji: '🚴' },
    delivered: { text: 'Delivered!', emoji: '🎉' },
    cancelled: { text: 'Cancelled', emoji: '❌' },
};

const LiveTracking = ({ order, isConnected }) => {
    const [countdown, setCountdown] = useState('');

    // ETA countdown
    useEffect(() => {
        if (!order?.estimatedDelivery || order.status === 'delivered' || order.status === 'cancelled') {
            setCountdown('');
            return;
        }

        const updateCountdown = () => {
            const now = new Date();
            const eta = new Date(order.estimatedDelivery);
            const diff = eta - now;

            if (diff <= 0) {
                setCountdown('Arriving now');
                return;
            }

            const mins = Math.floor(diff / 60000);
            if (mins < 60) {
                setCountdown(`${mins}`);
            } else {
                const hrs = Math.floor(mins / 60);
                setCountdown(`${hrs}h ${mins % 60}m`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 30000); // update every 30s
        return () => clearInterval(interval);
    }, [order?.estimatedDelivery, order?.status]);

    const progress = STATUS_PROGRESS[order?.status] || 0;
    const statusInfo = STATUS_MESSAGES[order?.status] || STATUS_MESSAGES.placed;

    // Rider position (percentage from left)
    const riderLeft = useMemo(() => {
        const base = 30; // px offset for restaurant
        const range = 70; // percentage of road
        return `calc(${base}px + ${(progress / 100) * range}%)`;
    }, [progress]);

    // Random buildings
    const buildings = useMemo(() => {
        return [40, 70, 30, 55, 45, 35, 60, 50, 38, 65].map((h, i) => ({
            height: h,
            key: i,
        }));
    }, []);

    if (!order || order.status === 'cancelled') return null;

    return (
        <div className={styles.tracking}>
            {/* Visual Map */}
            <div className={styles.tracking__mapContainer}>
                {/* Clouds */}
                <span className={styles.tracking__cloud}>☁️</span>
                <span className={styles.tracking__cloud}>⛅</span>
                <span className={styles.tracking__cloud}>☁️</span>

                {/* Buildings */}
                <div className={styles.tracking__buildings}>
                    {buildings.map((b) => (
                        <div key={b.key} className={styles.tracking__building} style={{ height: b.height }} />
                    ))}
                </div>

                {/* Road */}
                <div className={styles.tracking__road}>
                    <div className={styles.tracking__roadProgress} style={{ width: `${progress}%` }} />
                </div>

                {/* Restaurant marker */}
                <div className={styles.tracking__restaurant}>🏪</div>

                {/* Rider */}
                {order.status !== 'placed' && order.status !== 'confirmed' && (
                    <>
                        <div className={styles.tracking__riderPulse} style={{ left: riderLeft }} />
                        <div className={styles.tracking__rider} style={{ left: riderLeft }}>
                            🛵
                        </div>
                    </>
                )}

                {/* Destination */}
                <div className={styles.tracking__destination}>🏠</div>
            </div>

            {/* Info Panel */}
            <div className={styles.tracking__info}>
                <div className={styles.tracking__infoHeader}>
                    <div className={styles.tracking__statusText}>
                        <span className={styles.tracking__statusEmoji}>{statusInfo.emoji}</span>
                        {statusInfo.text}
                    </div>
                    {isConnected && (
                        <div className={styles.tracking__liveBadge}>
                            <div className={styles.tracking__liveDot} />
                            LIVE
                        </div>
                    )}
                </div>

                {/* ETA */}
                {countdown && order.status !== 'delivered' && (
                    <div className={styles.tracking__eta}>
                        <div>
                            <div className={styles.tracking__etaTime}>{countdown}</div>
                            <div className={styles.tracking__etaLabel}>
                                {countdown === 'Arriving now' ? '' : 'min'}
                            </div>
                        </div>
                        <div className={styles.tracking__etaText}>
                            Estimated arrival at{' '}
                            {new Date(order.estimatedDelivery).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    </div>
                )}

                {/* Delivery Partner */}
                {['out_for_delivery', 'delivered'].includes(order.status) && (
                    <div className={styles.tracking__riderCard}>
                        <div className={styles.tracking__riderAvatar}>🧑</div>
                        <div className={styles.tracking__riderInfo}>
                            <div className={styles.tracking__riderName}>Delivery Partner</div>
                            <div className={styles.tracking__riderMeta}>
                                {order.status === 'out_for_delivery' ? 'On the way to you' : 'Order delivered'}
                            </div>
                        </div>
                        <button
                            className={styles.tracking__riderCall}
                            aria-label="Call delivery partner"
                            onClick={() => { }}
                        >
                            📞
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveTracking;
