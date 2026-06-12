import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyFoodOrders() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('eater'); // 'eater' or 'runner'
    const [orders, setOrders] = useState({
        as_eater: [],
        as_runner: []
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            const response = await fetch(`/api/food-orders/my-orders?user_id=${user.id}`);
            const data = await response.json();

            if (data.message === 'success') {
                setOrders(data.data);
            }
        } catch (error) {
            console.error('Error fetching my orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const eaterOrders = orders.as_eater || [];
    const runnerGroups = orders.as_runner || [];

    return (
        <div className="home-container mobile-first">
            {/* Header */}
            <section className="hero-section-mobile">
                <div className="container">
                    <button
                        onClick={() => navigate('/food-delivery')}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            marginLeft: '-0.5rem'
                        }}
                    >
                        ←
                    </button>
                    <h1 className="hero-greeting">📋 我的訂單</h1>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        查看我的跟團與開團記錄
                    </p>
                </div>
            </section>

            {/* Tab Switcher */}
            <section style={{ padding: '0 1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <TabButton
                        active={activeTab === 'eater'}
                        onClick={() => setActiveTab('eater')}
                        label={`我跟的團 (${eaterOrders.length})`}
                    />
                    <TabButton
                        active={activeTab === 'runner'}
                        onClick={() => setActiveTab('runner')}
                        label={`我開的團 (${runnerGroups.length})`}
                    />
                </div>
            </section>

            {/* Content */}
            <section style={{ padding: '0 1rem 5rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                        載入中...
                    </div>
                ) : activeTab === 'eater' ? (
                    <EaterOrdersList orders={eaterOrders} navigate={navigate} />
                ) : (
                    <RunnerGroupsList groups={runnerGroups} navigate={navigate} />
                )}
            </section>
        </div>
    );
}

function TabButton({ active, onClick, label }) {
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
                transition: 'all 0.2s',
                flex: 1
            }}
        >
            {label}
        </button>
    );
}

function EaterOrdersList({ orders, navigate }) {
    if (orders.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍱</div>
                <p style={{ marginBottom: '0.5rem' }}>尚未跟團</p>
                <p style={{ fontSize: '0.875rem' }}>去看看有哪些團購吧！</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order) => (
                <EaterOrderCard key={order.id} order={order} navigate={navigate} />
            ))}
        </div>
    );
}

function EaterOrderCard({ order, navigate }) {
    const status = order.group_status;
    const statusInfo = getStatusInfo(status);

    return (
        <div
            className="card"
            onClick={() => navigate(`/group-buy/${order.group_id}`)}
            style={{
                padding: '1rem',
                cursor: 'pointer'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>
                        {order.store_name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        📍 {order.store_location}
                    </div>
                </div>
                <div
                    style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        backgroundColor: statusInfo.color + '20',
                        color: statusInfo.color,
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        height: 'fit-content'
                    }}
                >
                    {statusInfo.text}
                </div>
            </div>

            {/* Order Details */}
            <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                    🛒 {order.item_desc}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#6b7280' }}>預估餐費</span>
                    <span style={{ fontWeight: '500' }}>${order.estimated_cost || 0}</span>
                </div>
                {order.actual_cost && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            <span style={{ color: '#6b7280' }}>實際餐費</span>
                            <span style={{ fontWeight: '600', color: '#f59e0b' }}>${order.actual_cost}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            <span style={{ color: '#6b7280' }}>運費</span>
                            <span style={{ fontWeight: '500' }}>${order.delivery_fee}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.9rem',
                            marginTop: '0.5rem',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid #e5e7eb'
                        }}>
                            <span style={{ fontWeight: '600' }}>應付總額</span>
                            <span style={{ fontWeight: '700', color: '#10b981', fontSize: '1.1rem' }}>
                                ${order.final_price || (order.actual_cost + order.delivery_fee)}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Runner Info */}
            {order.runner_name && (
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    🏃 跑腿者：{order.runner_name}
                </div>
            )}

            {/* Payment Status */}
            {order.actual_cost && (
                <div style={{ marginTop: '0.5rem' }}>
                    {order.is_paid ? (
                        <span style={{ fontSize: '0.8rem', color: '#10b981' }}>✅ 已付款</span>
                    ) : (
                        <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>⏳ 待付款</span>
                    )}
                </div>
            )}
        </div>
    );
}

function RunnerGroupsList({ groups, navigate }) {
    if (groups.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏃</div>
                <p style={{ marginBottom: '0.5rem' }}>尚未開團</p>
                <p style={{ fontSize: '0.875rem' }}>成為第一個開團的人吧！</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {groups.map((group) => (
                <RunnerGroupCard key={group.group_id} group={group} navigate={navigate} />
            ))}
        </div>
    );
}

function RunnerGroupCard({ group, navigate }) {
    const status = group.group_status;
    const statusInfo = getStatusInfo(status);
    const isWish = group.type === 'wish';

    return (
        <div
            className="card"
            onClick={() => navigate(`/group-buy/${group.group_id}`)}
            style={{
                padding: '1rem',
                cursor: 'pointer'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{isWish ? '💡' : '🍔'}</span>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>
                            {group.store_name}
                        </h3>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        📍 {group.store_location}
                    </div>
                </div>
                <div
                    style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        backgroundColor: statusInfo.color + '20',
                        color: statusInfo.color,
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        height: 'fit-content'
                    }}
                >
                    {statusInfo.text}
                </div>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
            }}>
                <div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                        訂單數量
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#10b981' }}>
                        {group.order_count || 0} 單
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                        運費
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                        ${group.delivery_fee}
                    </div>
                </div>
            </div>

            {/* Date */}
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
                📅 {formatDate(group.created_at)}
            </div>
        </div>
    );
}

function getStatusInfo(status) {
    const statusMap = {
        'open': { text: '收單中', color: '#10b981' },
        'stopped': { text: '已截止', color: '#f59e0b' },
        'buying': { text: '購買中', color: '#3b82f6' },
        'delivering': { text: '配送中', color: '#8b5cf6' },
        'completed': { text: '已完成', color: '#6b7280' }
    };
    return statusMap[status] || { text: status, color: '#6b7280' };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
}
