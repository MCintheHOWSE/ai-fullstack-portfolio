import React, { useState } from 'react';

const RidePublishForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        departureTime: '',
        seats: 1,
        price: 0,
        notes: '',
        type: 'car' // 'car' or 'scooter'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.id) {
                setError('偵測到登入資訊不完整 (缺少 ID)，請重新登入。');
                // Optional: Auto logout logic if we could access navigate, but here we just error.
                // We can force a reload to clear state if needed, but error message is safer for a modal.
                setLoading(false);
                return;
            }

            console.log('Submitting ride data:', {
                user_id: user.id,
                driver: user.name,
                ...formData
            });

            const response = await fetch('/api/rides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    driver: user.name,
                    origin: formData.origin,
                    destination: formData.destination,
                    departureTime: formData.departureTime,
                    seats: formData.seats,
                    price: formData.price,
                    notes: formData.notes,
                    type: formData.type
                })
            });

            console.log('Response status:', response.status);

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text.substring(0, 200));
                setError(`伺服器返回了非JSON響應。請確認後端服務器正常運行。`);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log('Server response:', data);

            if (response.ok) {
                onSuccess({
                    ...data.data,
                    type: formData.type,
                    dept: '東吳大學',
                    description: formData.notes,
                    time: new Date(formData.departureTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
                    date: new Date(formData.departureTime).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name.charAt(0))}&background=C8102E&color=fff`
                });
                onClose();
            } else {
                setError(data.error || '發布失敗，請稍後再試');
                console.error('Server error:', data);
            }
        } catch (err) {
            console.error('Publish error:', err);
            setError(`無法連接伺服器: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>發布共乘</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            車輛類型
                        </label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'car' })}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: formData.type === 'car' ? 'none' : '1px solid #E5E7EB',
                                    backgroundColor: formData.type === 'car' ? '#C8102E' : 'white',
                                    color: formData.type === 'car' ? 'white' : '#666',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                🚗 汽車
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'scooter' })}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: formData.type === 'scooter' ? 'none' : '1px solid #E5E7EB',
                                    backgroundColor: formData.type === 'scooter' ? '#C8102E' : 'white',
                                    color: formData.type === 'scooter' ? 'white' : '#666',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                🛵 機車
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            出發地
                        </label>
                        <select
                            value={formData.origin}
                            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                fontSize: '1rem',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="">選擇出發地</option>
                            <option value="城中校區">城中校區</option>
                            <option value="外雙溪校區">外雙溪校區</option>
                            <option value="捷運士林站">捷運士林站</option>
                            <option value="捷運劍南路站">捷運劍南路站</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            目的地
                        </label>
                        <select
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                fontSize: '1rem',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="">選擇目的地</option>
                            <option value="城中校區">城中校區</option>
                            <option value="外雙溪校區">外雙溪校區</option>
                            <option value="捷運士林站">捷運士林站</option>
                            <option value="捷運劍南路站">捷運劍南路站</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            出發時間
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.departureTime}
                            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            可載人數
                        </label>
                        <input
                            type="number"
                            value={formData.seats}
                            onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                            min="1"
                            max="4"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            每人費用 (NT$)
                        </label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                            min="0"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            備註
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="例如: 準時出發，歡迎同學搭乘"
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                            style={{ flex: 1 }}
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ flex: 1 }}
                        >
                            {loading ? '發布中...' : '發布共乘'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RidePublishForm;
