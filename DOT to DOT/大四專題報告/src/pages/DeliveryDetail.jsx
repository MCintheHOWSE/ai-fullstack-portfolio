import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { STANDARD_ITEMS, getTotalItemCount } from '../utils/priceCalculator';
import VerificationModal from '../components/VerificationModal';
import RenegotiationModal from '../components/RenegotiationModal';

export default function DeliveryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [delivery, setDelivery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showRenegotiationModal, setShowRenegotiationModal] = useState(false);

    useEffect(() => {
        fetchDelivery();
    }, [id]);

    const fetchDelivery = async () => {
        try {
            const response = await fetch(`/api/deliveries/${id}`);
            const data = await response.json();

            if (response.ok) {
                setDelivery(data.data);
            } else {
                alert(data.error || '訂單不存在');
                navigate('/logistics');
            }
        } catch (error) {
            console.error('Error fetching delivery:', error);
            alert('載入失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationSubmit = async (verificationData) => {
        try {
            const response = await fetch(`/api/deliveries/${id}/verify`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider_id: user.id,
                    ...verificationData
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(verificationData.items_match ? '物品核對完成，開始搬運！' : '已提交議價請求');
                setShowVerificationModal(false);
                fetchDelivery();
            } else {
                alert(data.error || '操作失敗');
            }
        } catch (error) {
            console.error('Error verifying delivery:', error);
            alert('網路錯誤');
        }
    };

    const handleRenegotiationResponse = async (accept) => {
        try {
            const response = await fetch(`/api/deliveries/${id}/renegotiation-response`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requester_id: user.id,
                    accept
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(accept ? '已接受新報價' : '已拒絕議價並取消訂單');
                setShowRenegotiationModal(false);
                fetchDelivery();
            } else {
                alert(data.error || '操作失敗');
            }
        } catch (error) {
            console.error('Error responding to renegotiation:', error);
            alert('網路錯誤');
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const response = await fetch(`/api/deliveries/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    new_status: newStatus
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('狀態已更新');
                fetchDelivery();
            } else {
                alert(data.error || '更新失敗');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('網路錯誤');
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('確定要取消此訂單嗎？')) return;

        try {
            const response = await fetch(`/api/deliveries/${id}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    reason: '使用者取消'
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('訂單已取消');
                fetchDelivery();
            } else {
                alert(data.error || '取消失敗');
            }
        } catch (error) {
            console.error('Error cancelling delivery:', error);
            alert('網路錯誤');
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                載入中...
            </div>
        );
    }

    if (!delivery) {
        return (
            <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                訂單不存在
            </div>
        );
    }

    let items = {};
    try {
        items = JSON.parse(delivery.items_json || '{}');
    } catch (e) {
        console.error('Failed to parse items_json:', e);
    }

    const totalItems = getTotalItemCount(items);
    const isRequester = delivery.requester_id === user.id;
    const isProvider = delivery.provider_id === user.id;
    const canCancel = (isRequester || isProvider) && delivery.status !== 'completed' && delivery.status !== 'cancelled';

    const statusColors = {
        'open': { bg: '#DBEAFE', text: '#1E40AF', label: '待接單' },
        'booked': { bg: '#FEF3C7', text: '#92400E', label: '已接單' },
        'moving': { bg: '#E0E7FF', text: '#3730A3', label: '搬運中' },
        'completed': { bg: '#D1FAE5', text: '#065F46', label: '已完成' },
        'cancelled': { bg: '#FEE2E2', text: '#991B1B', label: '已取消' },
        'negotiating': { bg: '#FCE7F3', text: '#831843', label: '議價中' }
    };

    const statusStyle = statusColors[delivery.status] || statusColors['open'];

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#3B82F6',
                        cursor: 'pointer',
                        marginBottom: '1rem',
                        fontSize: '1rem'
                    }}
                >
                    ← 返回
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>訂單詳情 #{delivery.id}</h1>
                    <div style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 'bold'
                    }}>
                        {statusStyle.label}
                    </div>
                </div>
            </div>

            {/* Renegotiation Alert (for requester) */}
            {isRequester && delivery.status === 'negotiating' && (
                <div className="card" style={{
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: '#FEF3C7',
                    border: '2px solid #FBBF24'
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#92400E' }}>
                        ⚠️ 需要您的回應
                    </h3>
                    <p style={{ marginBottom: '1rem', color: '#78350F' }}>
                        司機現場核對後提出新報價，請查看並決定是否接受。
                    </p>
                    <button
                        onClick={() => setShowRenegotiationModal(true)}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        查看議價詳情
                    </button>
                </div>
            )}

            {/* Provider Control Panel */}
            {isProvider && delivery.status === 'booked' && (
                <div className="card" style={{
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: '#F0F9FF',
                    border: '2px solid #3B82F6'
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        🚚 司機控制面板
                    </h3>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        到達現場後，請先核對物品再開始搬運
                    </p>
                    <button
                        onClick={() => setShowVerificationModal(true)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}
                    >
                        現場核對物品
                    </button>
                </div>
            )}

            {/* Provider Status Control */}
            {isProvider && delivery.status === 'moving' && (
                <div className="card" style={{
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: '#F0F9FF',
                    border: '2px solid #3B82F6'
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        🚚 司機控制面板
                    </h3>
                    <button
                        onClick={() => handleStatusUpdate('completed')}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}
                    >
                        標記為已完成
                    </button>
                </div>
            )}

            {/* Route Info */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>📍 路線資訊</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>起點</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{delivery.origin_poi}</div>
                        <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            {delivery.floor_origin}F {!delivery.has_elevator_origin && '(無電梯)'}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', color: '#3B82F6', fontSize: '1.5rem' }}>↓</div>
                    <div>
                        <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>終點</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{delivery.dest_poi}</div>
                        <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            {delivery.floor_dest}F {!delivery.has_elevator_dest && '(無電梯)'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    📦 物品清單（共 {totalItems} 件）
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                    {Object.entries(items)
                        .filter(([key, count]) => key !== 'special' && count > 0)
                        .map(([key, count]) => {
                            const item = STANDARD_ITEMS[key];
                            return item ? (
                                <div key={key} style={{
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{item.icon}</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#3B82F6', fontWeight: 'bold' }}>x{count}</div>
                                </div>
                            ) : null;
                        })}
                </div>
                {items.special && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                    }}>
                        <strong>特殊物品：</strong> {items.special}
                    </div>
                )}
                {delivery.verification_note && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: delivery.items_verified ? '#D1FAE5' : '#FEF3C7',
                        borderRadius: '8px',
                        border: `1px solid ${delivery.items_verified ? '#86EFAC' : '#FDE68A'}`
                    }}>
                        <strong>核對備註：</strong> {delivery.verification_note}
                    </div>
                )}
            </div>

            {/* Service Info */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>🚚 服務資訊</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {delivery.req_vehicle && (
                        <span style={{
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            fontSize: '0.9rem'
                        }}>
                            🚗 需要車輛
                        </span>
                    )}
                    {delivery.req_labor && (
                        <span style={{
                            backgroundColor: '#DBEAFE',
                            color: '#1E40AF',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            fontSize: '0.9rem'
                        }}>
                            💪 需要搬運
                        </span>
                    )}
                    {delivery.vehicle_type && (
                        <span style={{
                            backgroundColor: '#F3E8FF',
                            color: '#6B21A8',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            fontSize: '0.9rem'
                        }}>
                            {delivery.vehicle_type === 'motorcycle' ? '🏍️ 機車' :
                                delivery.vehicle_type === 'car' ? '🚗 轎車' :
                                    delivery.vehicle_type === 'van' ? '🚐 廂型車' : '🚚 貨車'}
                        </span>
                    )}
                </div>
                {delivery.notes && (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>備註</div>
                        <div style={{ fontSize: '0.95rem' }}>{delivery.notes}</div>
                    </div>
                )}
            </div>

            {/* Price Info */}
            <div className="card" style={{
                padding: '1.5rem',
                marginBottom: '1.5rem',
                backgroundColor: '#F0FDF4',
                border: '2px solid #86EFAC'
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>💰 價格資訊</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>預估價格</span>
                        <span style={{ fontWeight: 'bold' }}>NT$ {delivery.estimated_price}</span>
                    </div>
                    {delivery.quoted_price && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>報價</span>
                            <span style={{ fontWeight: 'bold', color: '#3B82F6' }}>NT$ {delivery.quoted_price}</span>
                        </div>
                    )}
                    {delivery.renegotiation_price && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                            <span>議價</span>
                            <span style={{ fontWeight: 'bold' }}>NT$ {delivery.renegotiation_price}</span>
                        </div>
                    )}
                    {delivery.final_price && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid #BBF7D0',
                            fontSize: '1.2rem'
                        }}>
                            <span>最終價格</span>
                            <span style={{ fontWeight: 'bold', color: '#16A34A' }}>NT$ {delivery.final_price}</span>
                        </div>
                    )}
                </div>
                {delivery.renegotiation_reason && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
                        <strong>議價原因：</strong> {delivery.renegotiation_reason}
                    </div>
                )}
            </div>

            {/* User Info */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>👥 參與者</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>需求者</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: '500' }}>
                            {delivery.requester_name}
                            {isRequester && <span style={{ color: '#3B82F6', marginLeft: '0.5rem' }}>(我)</span>}
                        </div>
                    </div>
                    {delivery.provider_name && (
                        <div>
                            <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>供給者</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '500' }}>
                                {delivery.provider_name}
                                {isProvider && <span style={{ color: '#3B82F6', marginLeft: '0.5rem' }}>(我)</span>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            {canCancel && (
                <button
                    onClick={handleCancel}
                    className="btn"
                    style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: '#FEE2E2',
                        color: '#991B1B',
                        border: '1px solid #FCA5A5'
                    }}
                >
                    取消訂單
                </button>
            )}

            {/* Modals */}
            {showVerificationModal && (
                <VerificationModal
                    delivery={delivery}
                    onClose={() => setShowVerificationModal(false)}
                    onSubmit={handleVerificationSubmit}
                />
            )}

            {showRenegotiationModal && (
                <RenegotiationModal
                    delivery={delivery}
                    onClose={() => setShowRenegotiationModal(false)}
                    onRespond={handleRenegotiationResponse}
                />
            )}
        </div>
    );
}
