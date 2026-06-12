import ChatRoom from './ChatRoom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DeliveryCard = ({ delivery, showActions, targetChatId }) => {
    const navigate = useNavigate();
    const [showChat, setShowChat] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Auto-open chat if targetChatId matches
    useEffect(() => {
        if (targetChatId && delivery.id == targetChatId) {
            setShowChat(true);
        }
    }, [targetChatId, delivery.id]);
    const isRequester = currentUser && delivery.user_id == currentUser.id;
    const isDriver = currentUser && delivery.driver_id == currentUser.id;
    const isParticipant = isRequester || isDriver;

    // Item type icons
    const itemTypeIcons = {
        package: '📦',
        food: '🍔',
        furniture: '🛋️',
        moving: '🏠'
    };

    // Vehicle type display
    const vehicleTypes = {
        motorcycle: '🏍️ 機車',
        car: '🚗 轎車',
        van: '🚐 廂型車',
        truck: '🚚 貨車'
    };

    const handleDelete = async () => {
        if (window.confirm('確定要刪除此配送請求嗎？')) {
            try {
                const response = await fetch(`/api/deliveries/${delivery.id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert('已刪除');
                    window.location.reload();
                } else {
                    alert('刪除失敗');
                }
            } catch (err) {
                console.error(err);
                alert('刪除時發生錯誤');
            }
        }
    };

    const handleAcceptDelivery = async () => {
        if (!currentUser) {
            alert('請先登入');
            navigate('/login');
            return;
        }
        if (window.confirm('確定要接受此配送請求嗎？')) {
            try {
                const response = await fetch(`/api/deliveries/${delivery.id}/accept`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ driver_id: currentUser.id })
                });

                if (response.ok) {
                    alert('接單成功！請進入聊天室與發布者確認細節。');
                    window.location.reload();
                } else {
                    const data = await response.json();
                    alert(data.error || '接單失敗');
                }
            } catch (error) {
                console.error('Accept error:', error);
                alert('發生錯誤');
            }
        }
    };

    return (
        <>
            <div className="card" style={{ padding: '1.5rem', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Item Type Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                        fontSize: '0.85rem',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: '#FEE2E2',
                        color: '#991B1B',
                        fontWeight: 'bold'
                    }}>
                        {itemTypeIcons[delivery.item_type]} {delivery.item_type === 'package' ? '包裹' : delivery.item_type === 'food' ? '外送' : delivery.item_type === 'furniture' ? '家具' : '搬家'}
                    </span>
                    <span style={{
                        fontSize: '0.8rem',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: delivery.status === 'completed' ? '#D1FAE5' : delivery.status === 'accepted' ? '#DBEAFE' : '#FEF3C7',
                        color: delivery.status === 'completed' ? '#059669' : delivery.status === 'accepted' ? '#1E40AF' : '#D97706'
                    }}>
                        {delivery.status === 'completed' ? '已完成' : delivery.status === 'accepted' ? '配送中' : '待接單'}
                    </span>
                </div>

                {/* Requester Info */}
                <div className="flex items-center gap-md">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(delivery.requester_name?.charAt(0) || 'U')}&background=C8102E&color=fff`}
                        alt={delivery.requester_name}
                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1rem' }}>{delivery.requester_name || '用戶'}</h3>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {delivery.pickup_time ? new Date(delivery.pickup_time).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '時間待定'}
                        </div>
                    </div>
                </div>

                {/* Route */}
                <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#10B981', fontSize: '1.2rem' }}>●</span>
                        <span style={{ fontWeight: 'bold' }}>{delivery.origin}</span>
                    </div>
                    <div style={{ paddingLeft: '0.7rem', borderLeft: '2px dashed #ddd', height: '20px', marginLeft: '0.3rem' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#EF4444', fontSize: '1.2rem' }}>📍</span>
                        <span style={{ fontWeight: 'bold' }}>{delivery.destination}</span>
                    </div>
                </div>

                {/* Item Description */}
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>貨物描述</div>
                    <div style={{ fontSize: '0.95rem' }}>{delivery.item_description}</div>
                </div>

                {/* Required Vehicle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                    <span>需求車型：</span>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{vehicleTypes[delivery.required_vehicle] || delivery.required_vehicle}</span>
                </div>

                {/* Notes (if any) */}
                {delivery.notes && (
                    <div style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                        備註：{delivery.notes}
                    </div>
                )}

                {/* Price and Actions */}
                <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#C8102E' }}>
                        ${delivery.price}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isParticipant && delivery.status !== 'completed' && (
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745' }}
                                onClick={() => setShowChat(true)}
                            >
                                聊天室
                            </button>
                        )}

                        {isRequester && showActions && delivery.status === 'open' && (
                            <>
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem' }}
                                    onClick={() => navigate(`/edit-delivery/${delivery.id}`)}
                                >
                                    編輯
                                </button>
                                <button
                                    className="btn btn-danger"
                                    style={{ padding: '0.5rem 1rem' }}
                                    onClick={handleDelete}
                                >
                                    刪除
                                </button>
                            </>
                        )}

                        {!isRequester && !isDriver && delivery.status === 'open' && (
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1.5rem' }}
                                onClick={handleAcceptDelivery}
                            >
                                接單配送
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {showChat && (
                <ChatRoom
                    itemId={delivery.id}
                    type="delivery"
                    currentUser={currentUser}
                    onClose={() => setShowChat(false)}
                    onComplete={() => {
                        setShowChat(false);
                        window.location.reload();
                    }}
                />
            )}
        </>
    );
};

export default DeliveryCard;
