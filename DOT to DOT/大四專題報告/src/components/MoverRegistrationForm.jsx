import React, { useState } from 'react';

const MoverRegistrationForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        vehicle: '機車',
        capacity: '300kg',
        price: 500,
        tags: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const vehicleOptions = [
        '機車',
        '小貨車 (3.5噸)',
        '中型貨車 (5噸)',
        '大型貨車 (10噸以上)'
    ];

    const tagOptions = [
        '宿舍搬遷',
        '校外租屋',
        '家具搬運',
        '快速到府',
        '可代購紙箱',
        '樓層搬運'
    ];

    const handleTagToggle = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.id) {
                setError('請先登入');
                setLoading(false);
                return;
            }

            // Ensure tags is always an array, even if empty
            const tagsToSubmit = formData.tags.length > 0 ? formData.tags : ['一般搬運'];

            console.log('Submitting mover data:', {
                user_id: user.id,
                vehicle: formData.vehicle,
                capacity: formData.capacity,
                price: formData.price,
                tags: tagsToSubmit
            });

            const response = await fetch('http://localhost:3000/api/movers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    vehicle: formData.vehicle,
                    capacity: formData.capacity,
                    price: formData.price,
                    tags: tagsToSubmit
                })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text.substring(0, 200));
                setError(`伺服器返回了非JSON響應。請確認後端服務器在 http://localhost:3000 正常運行。`);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log('Server response:', data);

            if (response.ok) {
                onSuccess(data.data);
                onClose();
            } else {
                setError(data.error || '註冊失敗，請稍後再試');
                console.error('Server error:', data);
            }
        } catch (err) {
            console.error('Registration error:', err);
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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>成為搬家夥伴</h2>
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
                        <select
                            value={formData.vehicle}
                            onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                        >
                            {vehicleOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            載重容量
                        </label>
                        <input
                            type="text"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            placeholder="例如: 300kg"
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
                            每趟價格 (NT$)
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
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500' }}>
                            服務標籤（可多選）
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {tagOptions.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagToggle(tag)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        border: formData.tags.includes(tag) ? 'none' : '1px solid #C8102E',
                                        backgroundColor: formData.tags.includes(tag) ? '#C8102E' : 'transparent',
                                        color: formData.tags.includes(tag) ? 'white' : '#C8102E',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
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
                            {loading ? '提交中...' : '提交申請'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MoverRegistrationForm;
