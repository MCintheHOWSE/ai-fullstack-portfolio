import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STANDARD_ITEMS, getTotalItemCount } from '../utils/priceCalculator';

export default function LogisticsLobby() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        req_vehicle: 'all',
        req_labor: 'all'
    });

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            const params = new URLSearchParams({
                user_id: user.id,  // Enable smart filtering based on provider capabilities
                status: 'open'
            });

            const response = await fetch(`/api/deliveries?${params}`);
            const data = await response.json();

            if (response.ok) {
                setDeliveries(data.data || []);
            } else {
                console.error('Error fetching deliveries:', data.error);
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDeliveries = deliveries.filter(d => {
        if (filter.req_vehicle !== 'all' && d.req_vehicle !== (filter.req_vehicle === 'true')) return false;
        if (filter.req_labor !== 'all' && d.req_labor !== (filter.req_labor === 'true')) return false;
        return true;
    });

    const handleAccept = async (deliveryId) => {
        if (!user.id) {
            alert('請先登入');
            navigate('/login');
            return;
        }

        if (window.confirm('確定要接受此訂單嗎？')) {
            try {
                const response = await fetch(`/api/deliveries/${deliveryId}/accept`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider_id: user.id })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('接單成功！');
                    navigate(`/logistics/${deliveryId}`);
                } else {
                    alert(data.error || '接單失敗');
                }
            } catch (error) {
                console.error('Error accepting delivery:', error);
                alert('網路錯誤，請稍後再試');
            }
        }
    };

    const renderDeliveryCard = (delivery) => {
        let items = {};
        try {
            items = JSON.parse(delivery.items_json || '{}');
        } catch (e) {
            console.error('Failed to parse items_json:', e);
        }

        const totalItems = getTotalItemCount(items);
        const itemsList = Object.entries(items)
            .filter(([key, count]) => key !== 'special' && count > 0)
            .map(([key, count]) => STANDARD_ITEMS[key] ? `${STANDARD_ITEMS[key].icon} ${STANDARD_ITEMS[key].name} x${count}` : `${key} x${count}`)
            .slice(0, 3);

        return (
            <div key={delivery.id} className="card" style={{ padding: '1.5rem', marginBottom: '1rem', cursor: 'pointer' }}
                onClick={() => navigate(`/logistics/${delivery.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            {delivery.origin_poi} → {delivery.dest_poi}
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>
                            發布者: {delivery.requester_name}
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: '#DBEAFE',
                        color: '#1E40AF',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                    }}>
                        NT$ {delivery.estimated_price}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {delivery.req_vehicle && (
                        <span style={{
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem'
                        }}>
                            🚗 需要車輛
                        </span>
                    )}
                    {delivery.req_labor && (
                        <span style={{
                            backgroundColor: '#DBEAFE',
                            color: '#1E40AF',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem'
                        }}>
                            💪 需要搬運
                        </span>
                    )}
                    {delivery.vehicle_type && (
                        <span style={{
                            backgroundColor: '#F3E8FF',
                            color: '#6B21A8',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem'
                        }}>
                            {delivery.vehicle_type === 'motorcycle' ? '🏍️ 機車' :
                                delivery.vehicle_type === 'car' ? '🚗 轎車' :
                                    delivery.vehicle_type === 'van' ? '🚐 廂型車' : '🚚 貨車'}
                        </span>
                    )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        <strong>物品清單（{totalItems}件）：</strong>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                        {itemsList.join(', ')}
                        {Object.keys(items).length > 3 && '...'}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
                    <span>🏢 起點: {delivery.floor_origin}F {!delivery.has_elevator_origin && '(無電梯)'}</span>
                    <span>→</span>
                    <span>🏢 終點: {delivery.floor_dest}F {!delivery.has_elevator_dest && '(無電梯)'}</span>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAccept(delivery.id);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
                >
                    接受訂單
                </button>
            </div>
        );
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    🚚 物流接單大廳
                </h1>
                <p style={{ color: '#666' }}>瀏覽並接受符合您條件的物流訂單</p>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>篩選條件</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>車輛需求</label>
                        <select
                            value={filter.req_vehicle}
                            onChange={(e) => setFilter({ ...filter, req_vehicle: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                        >
                            <option value="all">全部</option>
                            <option value="true">需要車輛</option>
                            <option value="false">不需要車輛</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>搬運需求</label>
                        <select
                            value={filter.req_labor}
                            onChange={(e) => setFilter({ ...filter, req_labor: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                        >
                            <option value="all">全部</option>
                            <option value="true">需要搬運</option>
                            <option value="false">不需要搬運</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    載入中...
                </div>
            ) : filteredDeliveries.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>目前沒有符合條件的訂單</p>
                    <p style={{ fontSize: '0.9rem' }}>請稍後再試或調整篩選條件</p>
                </div>
            ) : (
                <div>
                    <div style={{ marginBottom: '1rem', color: '#666' }}>
                        找到 {filteredDeliveries.length} 個訂單
                    </div>
                    {filteredDeliveries.map(renderDeliveryCard)}
                </div>
            )}
        </div>
    );
}
