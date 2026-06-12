import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom';

export default function GroupBuyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [groupBuy, setGroupBuy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [orderForm, setOrderForm] = useState({
        item_desc: '',
        estimated_cost: ''
    });
    const [showActualCostForm, setShowActualCostForm] = useState({});
    const [actualCostInput, setActualCostInput] = useState({});

    useEffect(() => {
        fetchGroupBuyDetail();
    }, [id]);

    const fetchGroupBuyDetail = async () => {
        try {
            const response = await fetch(`/api/group-buys/${id}`);
            const data = await response.json();

            if (data.message === 'success') {
                setGroupBuy(data.data);
            }
        } catch (error) {
            console.error('Error fetching group buy detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();

        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('/api/food-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    group_id: parseInt(id),
                    eater_id: user.id,
                    item_desc: orderForm.item_desc,
                    estimated_cost: parseInt(orderForm.estimated_cost) || 0
                })
            });

            const data = await response.json();

            if (data.message === 'success') {
                alert('跟團成功！');
                setShowOrderForm(false);
                setOrderForm({ item_desc: '', estimated_cost: '' });
                fetchGroupBuyDetail(); // Refresh
            } else {
                alert(data.error || '跟團失敗');
            }
        } catch (error) {
            console.error('Error joining group:', error);
            alert('跟團失敗，請稍後再試');
        }
    };

    const handleStopOrdering = async () => {
        if (!confirm('確定要停止收單嗎？停止後將無法再接受新訂單。')) return;

        try {
            const response = await fetch(`/api/group-buys/${id}/stop`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ runner_id: user.id })
            });

            const data = await response.json();
            if (data.message === 'success') {
                alert('已停止收單');
                fetchGroupBuyDetail();
            } else {
                alert(data.error || '操作失敗');
            }
        } catch (error) {
            console.error('Error stopping ordering:', error);
            alert('操作失敗，請稍後再試');
        }
    };

    const handleUpdateActualCost = async (orderId) => {
        const actualCost = actualCostInput[orderId];
        if (!actualCost || actualCost <= 0) {
            alert('請輸入有效的實際金額');
            return;
        }

        try {
            const response = await fetch(`/api/food-orders/${orderId}/actual-cost`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    actual_cost: parseInt(actualCost),
                    runner_id: user.id
                })
            });

            const data = await response.json();
            if (data.message === 'success') {
                alert('已更新實際金額');
                setShowActualCostForm({ ...showActualCostForm, [orderId]: false });
                setActualCostInput({ ...actualCostInput, [orderId]: '' });
                fetchGroupBuyDetail();
            } else {
                alert(data.error || '更新失敗');
            }
        } catch (error) {
            console.error('Error updating actual cost:', error);
            alert('更新失敗，請稍後再試');
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            const response = await fetch(`/api/group-buys/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    runner_id: user.id
                })
            });

            const data = await response.json();
            if (data.message === 'success') {
                alert(`已更新狀態為：${getStatusText(newStatus)}`);
                fetchGroupBuyDetail();
            } else {
                alert(data.error || '更新失敗');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('更新失敗，請稍後再試');
        }
    };

    if (loading) {
        return (
            <div className="home-container mobile-first">
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    載入中...
                </div>
            </div>
        );
    }

    if (!groupBuy) {
        return (
            <div className="home-container mobile-first">
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    團購不存在
                </div>
            </div>
        );
    }

    const isRunner = user && user.id === groupBuy.runner_id;
    const isWish = groupBuy.type === 'wish';
    const canJoin = groupBuy.status === 'open' && !isRunner;
    const totalOrders = groupBuy.orders?.length || 0;

    return (
        <div className="home-container mobile-first">
            {/* Header */}
            <section className="hero-section-mobile">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
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
                            <h1 className="hero-greeting">{isWish ? '💡' : '🍔'} {groupBuy.store_name}</h1>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                                📍 {groupBuy.store_location}
                            </p>
                        </div>
                        {/* Chat Button - visible to runner and eaters who have joined */}
                        {user && totalOrders > 0 && (isRunner || groupBuy.orders?.some(o => o.eater_id === user.id)) && (
                            <button
                                onClick={() => setShowChat(true)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                💬 聊天室
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section style={{ padding: '1rem', paddingBottom: '5rem' }}>
                {/* Status Card */}
                <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem', backgroundColor: getStatusColor(groupBuy.status) + '10' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                狀態
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: getStatusColor(groupBuy.status) }}>
                                {getStatusText(groupBuy.status)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                收單數量
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                                {totalOrders} / {groupBuy.max_orders}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Photo */}
                {groupBuy.menu_photo_url && (
                    <div className="card" style={{ padding: 0, marginBottom: '1rem', overflow: 'hidden' }}>
                        <img
                            src={groupBuy.menu_photo_url}
                            alt="菜單"
                            style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                        />
                    </div>
                )}

                {/* Info Card */}
                <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                        📋 團購資訊
                    </h3>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <InfoRow label="跑腿者" value={groupBuy.runner_name || '等待接單'} icon="🏃" />
                        <InfoRow label="運費" value={`$${groupBuy.delivery_fee} /份`} icon="💰" />
                        <InfoRow label="截止時間" value={formatDateTime(groupBuy.deadline)} icon="⏰" />
                        {groupBuy.meet_location && (
                            <InfoRow label="面交地點" value={groupBuy.meet_location} icon="📍" />
                        )}
                        {groupBuy.notes && (
                            <InfoRow label="備註" value={groupBuy.notes} icon="💬" />
                        )}
                    </div>
                </div>

                {/* Runner Controls */}
                {isRunner && groupBuy.status !== 'completed' && (
                    <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem', backgroundColor: '#eff6ff' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                            🎛️ 跑腿者控制面板
                        </h3>

                        {/* Status Control */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#6b7280' }}>
                                更新狀態
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {groupBuy.status === 'open' && (
                                    <button
                                        onClick={handleStopOrdering}
                                        className="btn"
                                        style={{ backgroundColor: '#f59e0b', color: 'white', fontSize: '0.875rem', padding: '0.5rem' }}
                                    >
                                        🔒 停止收單
                                    </button>
                                )}
                                {groupBuy.status === 'stopped' && (
                                    <button
                                        onClick={() => handleUpdateStatus('buying')}
                                        className="btn btn-primary"
                                        style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                                    >
                                        🛍️ 開始購買
                                    </button>
                                )}
                                {groupBuy.status === 'buying' && (
                                    <button
                                        onClick={() => handleUpdateStatus('delivering')}
                                        className="btn btn-primary"
                                        style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                                    >
                                        🚚 開始配送
                                    </button>
                                )}
                                {groupBuy.status === 'delivering' && (
                                    <button
                                        onClick={() => handleUpdateStatus('completed')}
                                        className="btn"
                                        style={{ backgroundColor: '#10b981', color: 'white', fontSize: '0.875rem', padding: '0.5rem' }}
                                    >
                                        ✅ 完成訂單
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                            💡 提示：購買完成後，請為每個訂單輸入實際金額
                        </div>
                    </div>
                )}

                {/* Orders List */}
                <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                        🧾 訂單列表（{totalOrders}）
                    </h3>

                    {totalOrders === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                            <p>尚無訂單</p>
                            <p style={{ fontSize: '0.875rem' }}>成為第一個跟團的人吧！</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {groupBuy.orders.map((order, index) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    index={index}
                                    isRunner={isRunner}
                                    onUpdateCost={handleUpdateActualCost}
                                    showCostForm={showActualCostForm}
                                    setShowCostForm={setShowActualCostForm}
                                    costInput={actualCostInput}
                                    setCostInput={setActualCostInput}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {canJoin && !showOrderForm && (
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '600' }}
                        onClick={() => setShowOrderForm(true)}
                    >
                        🛒 立即跟團
                    </button>
                )}

                {/* Order Form */}
                {showOrderForm && (
                    <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f0fdf4' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                            🛒 填寫訂單
                        </h3>

                        <form onSubmit={handleJoinGroup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    想吃什麼？ *
                                </label>
                                <textarea
                                    value={orderForm.item_desc}
                                    onChange={(e) => setOrderForm({ ...orderForm, item_desc: e.target.value })}
                                    placeholder="例：雞排不切不辣 x1"
                                    required
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    預估餐費（選填）
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        value={orderForm.estimated_cost}
                                        onChange={(e) => setOrderForm({ ...orderForm, estimated_cost: e.target.value })}
                                        placeholder="90"
                                        min="0"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 0.75rem 0.75rem 1.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 0' }}>
                                    💡 實際金額以現場購買為準
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    className="btn"
                                    style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#1f2937' }}
                                    onClick={() => setShowOrderForm(false)}
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    確認跟團
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </section>

            {/* Chat Room Modal */}
            {showChat && (
                <ChatRoom
                    itemId={id}
                    type="food"
                    currentUser={user}
                    onClose={() => setShowChat(false)}
                    onComplete={() => {
                        setShowChat(false);
                        fetchGroupBuyDetail();
                    }}
                />
            )}
        </div>
    );
}

function InfoRow({ label, value, icon }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {icon} {label}
            </span>
            <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                {value}
            </span>
        </div>
    );
}

function OrderCard({ order, index, isRunner, onUpdateCost, showCostForm, setShowCostForm, costInput, setCostInput }) {
    return (
        <div style={{
            padding: '0.75rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                    #{index + 1} {order.eater_name}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    預估 ${order.estimated_cost || 0}
                </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                {order.item_desc}
            </div>

            {/* Actual Cost Display or Input */}
            {order.actual_cost ? (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '4px', fontSize: '0.875rem' }}>
                    💰 實際金額：${order.actual_cost} + ${order.delivery_fee} = ${order.final_price || (order.actual_cost + order.delivery_fee)}
                </div>
            ) : isRunner && showCostForm[order.id] ? (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#e0f2fe', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                        輸入實際餐費
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '0.875rem' }}>$</span>
                            <input
                                type="number"
                                value={costInput[order.id] || ''}
                                onChange={(e) => setCostInput({ ...costInput, [order.id]: e.target.value })}
                                placeholder="100"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.5rem 0.5rem 1.5rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <button
                            onClick={() => onUpdateCost(order.id)}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            確認
                        </button>
                        <button
                            onClick={() => setShowCostForm({ ...showCostForm, [order.id]: false })}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#e5e7eb',
                                color: '#1f2937',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }}
                        >
                            取消
                        </button>
                    </div>
                </div>
            ) : isRunner ? (
                <button
                    onClick={() => setShowCostForm({ ...showCostForm, [order.id]: true })}
                    style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        width: '100%',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    💰 輸入實際金額
                </button>
            ) : null}
        </div>
    );
}

function formatDateTime(datetime) {
    const date = new Date(datetime);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
}

function getStatusColor(status) {
    switch (status) {
        case 'open': return '#10b981';
        case 'stopped': return '#f59e0b';
        case 'buying': return '#3b82f6';
        case 'delivering': return '#8b5cf6';
        case 'completed': return '#6b7280';
        default: return '#6b7280';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'open': return '⏳ 收單中';
        case 'stopped': return '🔒 已截止';
        case 'buying': return '🛍️ 購買中';
        case 'delivering': return '🚚 配送中';
        case 'completed': return '✅ 已完成';
        default: return status;
    }
}
