import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STANDARD_ITEMS, getTotalItemCount } from '../utils/priceCalculator';

export default function MyDeliveries() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'jobs'
    const [myRequests, setMyRequests] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user.id) {
            navigate('/login');
            return;
        }
        fetchMyDeliveries();
    }, []);

    const fetchMyDeliveries = async () => {
        try {
            const [requestsRes, jobsRes] = await Promise.all([
                fetch(`/api/deliveries/my-requests?user_id=${user.id}`),
                fetch(`/api/deliveries/my-jobs?user_id=${user.id}`)
            ]);

            const requestsData = await requestsRes.json();
            const jobsData = await jobsRes.json();

            if (requestsRes.ok) setMyRequests(requestsData.data || []);
            if (jobsRes.ok) setMyJobs(jobsData.data || []);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'open': { bg: '#DBEAFE', text: '#1E40AF', label: '待接單' },
            'booked': { bg: '#FEF3C7', text: '#92400E', label: '已接單' },
            'moving': { bg: '#E0E7FF', text: '#3730A3', label: '搬運中' },
            'completed': { bg: '#D1FAE5', text: '#065F46', label: '已完成' },
            'cancelled': { bg: '#FEE2E2', text: '#991B1B', label: '已取消' },
            'negotiating': { bg: '#FCE7F3', text: '#831843', label: '議價中' }
        };

        const style = colors[status] || colors['open'];

        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.text,
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeigh: '500'
            }}>
                {style.label}
            </span>
        );
    };

    const renderDeliveryCard = (delivery, isRequest) => {
        let items = {};
        try {
            items = JSON.parse(delivery.items_json || '{}');
        } catch (e) {
            console.error('Failed to parse items_json:', e);
        }

        const totalItems = getTotalItemCount(items);
        const counterpartyName = isRequest ? delivery.provider_name : delivery.requester_name;

        return (
            <div
                key={delivery.id}
                className="card"
                style={{ padding: '1.5rem', marginBottom: '1rem', cursor: 'pointer' }}
                onClick={() => navigate(`/logistics/${delivery.id}`)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {delivery.origin_poi} → {delivery.dest_poi}
                        </h3>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {isRequest ? (
                                counterpartyName ? `司機: ${counterpartyName}` : '尚未配對司機'
                            ) : (
                                `需求者: ${counterpartyName}`
                            )}
                        </div>
                    </div>
                    {getStatusBadge(delivery.status)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>物品數量</div>
                        <div style={{ fontSize: '1rem', fontWeight: '500' }}>{totalItems} 件</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>預估費用</div>
                        <div style={{ fontSize: '1rem', fontWeight: '500', color: '#3B82F6' }}>
                            NT$ {delivery.final_price || delivery.quoted_price || delivery.estimated_price}
                        </div>
                    </div>
                </div>

                {delivery.status === 'negotiating' && (
                    <div style={{
                        padding: '0.75rem',
                        backgroundColor: '#FEF3C7',
                        borderRadius: '8px',
                        border: '1px solid #FDE68A',
                        marginTop: '0.5rem'
                    }}>
                        <strong>⚠️ 需要議價回應</strong>
                        <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                            新報價: NT$ {delivery.renegotiation_price}
                        </div>
                    </div>
                )}

                <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem' }}>
                    發布時間: {new Date(delivery.created_at).toLocaleString('zh-TW')}
                </div>
            </div>
        );
    };

    if (!user.id) {
        return null;
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                我的訂單
            </h1>

            {/* Tab Switcher */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                borderBottom: '2px solid #E5E7EB'
            }}>
                <button
                    onClick={() => setActiveTab('requests')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'requests' ? '3px solid #3B82F6' : 'none',
                        color: activeTab === 'requests' ? '#3B82F6' : '#6B7280',
                        fontWeight: activeTab === 'requests' ? 'bold' : 'normal',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        marginBottom: '-2px'
                    }}
                >
                    我發布的 {myRequests.length > 0 && `(${myRequests.length})`}
                </button>
                <button
                    onClick={() => setActiveTab('jobs')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'jobs' ? '3px solid #3B82F6' : 'none',
                        color: activeTab === 'jobs' ? '#3B82F6' : '#6B7280',
                        fontWeight: activeTab === 'jobs' ? 'bold' : 'normal',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        marginBottom: '-2px'
                    }}
                >
                    我接的單 {myJobs.length > 0 && `(${myJobs.length})`}
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    載入中...
                </div>
            ) : activeTab === 'requests' ? (
                myRequests.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
                            您還沒有發布任何訂單
                        </p>
                        <button
                            onClick={() => navigate('/logistics/create')}
                            className="btn btn-primary"
                            style={{ padding: '0.75rem 2rem' }}
                        >
                            創建新訂單
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '1rem', color: '#666' }}>
                            共 {myRequests.length} 筆訂單
                        </div>
                        {myRequests.map(delivery => renderDeliveryCard(delivery, true))}
                    </>
                )
            ) : (
                myJobs.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
                            您還沒有接取任何訂單
                        </p>
                        <button
                            onClick={() => navigate('/logistics/lobby')}
                            className="btn btn-primary"
                            style={{ padding: '0.75rem 2rem' }}
                        >
                            前往接單大廳
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '1rem', color: '#666' }}>
                            共 {myJobs.length} 筆工作
                        </div>
                        {myJobs.map(delivery => renderDeliveryCard(delivery, false))}
                    </>
                )
            )}
        </div>
    );
}
