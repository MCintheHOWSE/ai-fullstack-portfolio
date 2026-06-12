import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FoodDelivery() {
    const [groupBuys, setGroupBuys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'group', 'wish'
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroupBuys();
    }, [filter]);

    const fetchGroupBuys = async () => {
        try {
            const url = filter === 'all'
                ? '/api/group-buys'
                : `/api/group-buys?type=${filter}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.message === 'success') {
                setGroupBuys(data.data);
            }
        } catch (error) {
            console.error('Error fetching group buys:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate('/create-group-buy');
    };

    const handleMakeWish = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate('/make-wish');
    };

    const handleCardClick = (id) => {
        navigate(`/group-buy/${id}`);
    };

    return (
        <div className="home-container mobile-first">
            {/* Header */}
            <section className="hero-section-mobile">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="hero-greeting">🍔 餐飲跑腿</h1>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                                順路幫忙買，銅板價運費
                            </p>
                        </div>
                        {user && (
                            <button
                                onClick={() => navigate('/my-food-orders')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                📋 我的訂單
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Action Buttons */}
            <section style={{ padding: '1rem', paddingTop: 0 }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem' }}
                        onClick={handleCreateGroup}
                    >
                        🛒 我要開團
                    </button>
                    <button
                        className="btn"
                        style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem', backgroundColor: '#f59e0b', color: 'white' }}
                        onClick={handleMakeWish}
                    >
                        💡 我要許願
                    </button>
                </div>
            </section>

            {/* Filter Tabs */}
            <section style={{ padding: '0 1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <FilterTab
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                        label="全部"
                    />
                    <FilterTab
                        active={filter === 'group'}
                        onClick={() => setFilter('group')}
                        label="順路開團"
                    />
                    <FilterTab
                        active={filter === 'wish'}
                        onClick={() => setFilter('wish')}
                        label="專屬許願"
                    />
                </div>
            </section>

            {/* Group Buy List */}
            <section style={{ padding: '0 1rem 5rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                        載入中...
                    </div>
                ) : groupBuys.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍱</div>
                        <p>目前沒有開放的團購</p>
                        <p style={{ fontSize: '0.875rem' }}>成為第一個開團的人吧！</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {groupBuys.map((groupBuy) => (
                            <GroupBuyCard
                                key={groupBuy.id}
                                groupBuy={groupBuy}
                                onClick={() => handleCardClick(groupBuy.id)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function FilterTab({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'none',
                borderBottom: active ? '2px solid var(--primary-color)' : '2px solid transparent',
                color: active ? 'var(--primary-color)' : '#6b7280',
                fontWeight: active ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            {label}
        </button>
    );
}

function GroupBuyCard({ groupBuy, onClick }) {
    const isWish = groupBuy.type === 'wish';
    const deadline = new Date(groupBuy.deadline);
    const now = new Date();
    const isUrgent = (deadline - now) < 3600000; // Less than 1 hour

    const getStatusBadge = () => {
        if (groupBuy.status === 'open') {
            return { text: '收單中', color: '#10b981' };
        } else if (groupBuy.status === 'stopped') {
            return { text: '已截止', color: '#f59e0b' };
        }
        return { text: groupBuy.status, color: '#6b7280' };
    };

    const status = getStatusBadge();

    return (
        <div
            className="card"
            onClick={onClick}
            style={{
                padding: '1rem',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: isUrgent ? '2px solid #f59e0b' : undefined
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{isWish ? '💡' : '🍔'}</span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                            {groupBuy.store_name}
                        </h3>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📍 {groupBuy.store_location}
                    </div>
                </div>
                <div
                    style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        backgroundColor: status.color + '20',
                        color: status.color,
                        fontSize: '0.75rem',
                        fontWeight: '600'
                    }}
                >
                    {status.text}
                </div>
            </div>

            {/* Menu Photo (if exists) */}
            {groupBuy.menu_photo_url && (
                <div style={{ marginBottom: '0.75rem', borderRadius: '8px', overflow: 'hidden' }}>
                    <img
                        src={groupBuy.menu_photo_url}
                        alt="菜單"
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                    />
                </div>
            )}

            {/* Info Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                marginBottom: '0.75rem'
            }}>
                <InfoItem label="運費" value={`$${groupBuy.delivery_fee}`} icon="💰" />
                <InfoItem label="限額" value={`${groupBuy.order_count || 0}/${groupBuy.max_orders}`} icon="👥" />
                <InfoItem
                    label="截止"
                    value={formatDeadline(groupBuy.deadline)}
                    icon="⏰"
                    urgent={isUrgent}
                />
                {isWish ? (
                    <InfoItem label="狀態" value="等待接單" icon="⏳" />
                ) : (
                    <InfoItem label="跑腿者" value={groupBuy.runner_name || '匿名'} icon="🏃" />
                )}
            </div>

            {/* Notes (if exists) */}
            {groupBuy.notes && (
                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                    💬 {groupBuy.notes}
                </div>
            )}
        </div>
    );
}

function InfoItem({ label, value, icon, urgent }) {
    return (
        <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                {icon} {label}
            </div>
            <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: urgent ? '#f59e0b' : '#1f2937'
            }}>
                {value}
            </div>
        </div>
    );
}

function formatDeadline(deadline) {
    const date = new Date(deadline);
    const now = new Date();
    const diff = date - now;

    if (diff < 0) return '已截止';
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}分鐘後`;
    }
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}小時後`;
    }

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');

    return `${month}/${day} ${hour}:${minute}`;
}
