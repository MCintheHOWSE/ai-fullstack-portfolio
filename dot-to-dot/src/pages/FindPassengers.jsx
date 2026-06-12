import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FindPassengers() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [driverVehicle, setDriverVehicle] = useState('scooter'); // 'scooter' or 'car'
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch('/api/ride-requests');
            const data = await response.json();
            if (data.message === 'success') {
                setRequests(data.data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const handleInvite = async (request) => {
        if (!user) {
            alert('請先登入');
            navigate('/login');
            return;
        }

        // Prevent inviting own request
        if (request.user_id === user.id) {
            alert('你不能邀請自己的乘車需求');
            return;
        }

        try {
            const response = await fetch(`/api/ride-requests/${request.id}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driver_id: user.id,
                    driver_name: user.name
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`已成功發送邀請給 ${request.user_name}！\n對方將收到通知。`);
            } else {
                alert(data.error || '發送邀請失敗，請稍後再試。');
            }
        } catch (error) {
            console.error('Error sending invite:', error);
            alert('發生錯誤，請稍後再試。');
        }
    };

    // Filter Logic based on Matrix
    const filteredRequests = requests.filter(req => {
        // Don't show user's own requests
        if (user && req.user_id === user.id) {
            return false;
        }

        if (driverVehicle === 'scooter') {
            // Scooter Logic:
            // - Hide if passenger_count > 1
            // - Hide if preferred_vehicle is 'car'
            if (req.passenger_count > 1) return false;
            if (req.preferred_vehicle === 'car') return false;
            return true;
        } else {
            // Car Logic:
            // - Hide if preferred_vehicle is 'scooter'
            if (req.preferred_vehicle === 'scooter') return false;
            return true;
        }
    });

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '800px' }}>
            <div className="flex justify-between items-center mb-md">
                <h2>尋找順路乘客</h2>
                {/* Toggle Switch or Radio for Driver Vehicle */}
                <div style={{ backgroundColor: '#f0f0f0', padding: '0.5rem', borderRadius: '8px', display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn ${driverVehicle === 'scooter' ? 'btn-primary' : ''}`}
                        style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: driverVehicle === 'scooter' ? undefined : 'transparent' }}
                        onClick={() => setDriverVehicle('scooter')}
                    >
                        🛵 機車
                    </button>
                    <button
                        className={`btn ${driverVehicle === 'car' ? 'btn-primary' : ''}`}
                        style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: driverVehicle === 'car' ? undefined : 'transparent' }}
                        onClick={() => setDriverVehicle('car')}
                    >
                        🚗 汽車
                    </button>
                </div>
            </div>

            <div className="grid gap-md">
                {filteredRequests.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>目前沒有符合條件的需求。</p>
                ) : (
                    filteredRequests.map(req => (
                        <div key={req.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                            <div>
                                <div className="flex items-center gap-sm mb-sm">
                                    <strong style={{ fontSize: '1.1rem' }}>{req.user_name || '同學'}</strong>
                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>⭐ {req.user_rating?.toFixed(1) || 'NEW'}</span>
                                </div>
                                <div className="flex flex-col gap-xs">
                                    <div className="flex items-center gap-sm">
                                        <span style={{ color: '#10B981' }}>🟢</span> {req.origin}
                                    </div>
                                    <div className="flex items-center gap-sm">
                                        <span style={{ color: '#EF4444' }}>🔴</span> {req.destination}
                                    </div>
                                </div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#4B5563', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span>👥 {req.passenger_count} 人</span>
                                    <span>|</span>
                                    <span>{req.preferred_vehicle === 'scooter' ? '🛵 指定機車' : req.preferred_vehicle === 'car' ? '🚗 指定汽車' : '🚐 不限載具'}</span>
                                    {req.driver_gender_preference === 'male' && <span style={{ color: '#2563EB', fontWeight: '500' }}>| 👨 限男駕駛</span>}
                                    {req.driver_gender_preference === 'female' && <span style={{ color: '#DB2777', fontWeight: '500' }}>| 👩 限女駕駛</span>}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-sm">
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#C8102E' }}>
                                    ${req.budget}
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleInvite(req)}
                                >
                                    邀請共乘
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
