import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculatePrice, STANDARD_ITEMS, getRecommendedVehicle, getTotalItemCount } from '../utils/priceCalculator';

export default function CreateDelivery() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [formData, setFormData] = useState({
        origin_poi: '',
        dest_poi: '',
        floor_origin: 1,
        floor_dest: 1,
        has_elevator_origin: false,
        has_elevator_dest: false,
        req_vehicle: true,
        req_labor: false,
        vehicle_type: '',
        notes: ''
    });

    const [items, setItems] = useState(
        Object.keys(STANDARD_ITEMS).reduce((acc, key) => ({ ...acc, [key]: 0 }), { special: '' })
    );

    const [loading, setLoading] = useState(false);

    // Calculate real-time price
    const estimatedPrice = calculatePrice({
        items,
        floor_origin: parseInt(formData.floor_origin) || 0,
        floor_dest: parseInt(formData.floor_dest) || 0,
        has_elevator_origin: formData.has_elevator_origin,
        has_elevator_dest: formData.has_elevator_dest,
        vehicle_type: formData.vehicle_type
    });

    const recommendedVehicle = getRecommendedVehicle(items);
    const totalItems = getTotalItemCount(items);

    const handleItemChange = (itemKey, delta) => {
        setItems(prev => ({
            ...prev,
            [itemKey]: Math.max(0, (prev[itemKey] || 0) + delta)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user.id) {
            alert('請先登入');
            navigate('/login');
            return;
        }

        if (totalItems === 0) {
            alert('請至少選擇一項物品');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/deliveries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requester_id: user.id,
                    origin_poi: formData.origin_poi,
                    dest_poi: formData.dest_poi,
                    floor_origin: parseInt(formData.floor_origin),
                    floor_dest: parseInt(formData.floor_dest),
                    has_elevator_origin: formData.has_elevator_origin,
                    has_elevator_dest: formData.has_elevator_dest,
                    items_json: JSON.stringify(items),
                    req_vehicle: formData.req_vehicle,
                    req_labor: formData.req_labor,
                    vehicle_type: formData.vehicle_type || recommendedVehicle,
                    notes: formData.notes
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('物流訂單創建成功！');
                navigate(`/logistics/${data.data.id}`);
            } else {
                alert(data.error || '創建失敗');
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
            alert('網路錯誤，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    📦 創建物流訂單
                </h1>
                <p style={{ color: '#666' }}>填寫搬運需求，我們會為您媒合合適的司機</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Location Info */}
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>📍 地點資訊</h3>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>起點</label>
                        <input
                            type="text"
                            value={formData.origin_poi}
                            onChange={(e) => setFormData({ ...formData, origin_poi: e.target.value })}
                            placeholder="例如: 外雙溪校區第一教研大樓"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>樓層</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.floor_origin}
                                onChange={(e) => setFormData({ ...formData, floor_origin: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.has_elevator_origin}
                                    onChange={(e) => setFormData({ ...formData, has_elevator_origin: e.target.checked })}
                                />
                                有電梯
                            </label>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>終點</label>
                        <input
                            type="text"
                            value={formData.dest_poi}
                            onChange={(e) => setFormData({ ...formData, dest_poi: e.target.value })}
                            placeholder="例如: 城中校區宿舍"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>樓層</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.floor_dest}
                                onChange={(e) => setFormData({ ...formData, floor_dest: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.has_elevator_dest}
                                    onChange={(e) => setFormData({ ...formData, has_elevator_dest: e.target.checked })}
                                />
                                有電梯
                            </label>
                        </div>
                    </div>
                </div>

                {/* Items Selection */}
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>📦 物品清單</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>使用計數器選擇您要搬運的物品</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                        {Object.entries(STANDARD_ITEMS).map(([key, item]) => (
                            <div key={key} style={{
                                border: items[key] > 0 ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                                borderRadius: '8px',
                                padding: '1rem',
                                textAlign: 'center',
                                backgroundColor: items[key] > 0 ? '#EFF6FF' : '#fff'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>{item.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleItemChange(key, -1)}
                                        disabled={items[key] === 0}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            border: '1px solid #E5E7EB',
                                            backgroundColor: items[key] === 0 ? '#F3F4F6' : '#fff',
                                            cursor: items[key] === 0 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        -
                                    </button>
                                    <span style={{ minWidth: '24px', fontWeight: 'bold', fontSize: '1.1rem' }}>{items[key]}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleItemChange(key, 1)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            border: '1px solid #3B82F6',
                                            backgroundColor: '#3B82F6',
                                            color: '#fff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalItems > 0 && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: '#F0F9FF',
                            borderRadius: '8px',
                            border: '1px solid #BFDBFE'
                        }}>
                            <strong>總計：{totalItems} 件物品</strong>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                建議車型: <strong>{recommendedVehicle === 'motorcycle' ? '🏍️ 機車' :
                                    recommendedVehicle === 'car' ? '🚗 轎車' :
                                        recommendedVehicle === 'van' ? '🚐 廂型車' : '🚚 貨車'}</strong>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>特殊物品說明（選填）</label>
                        <textarea
                            value={items.special}
                            onChange={(e) => setItems({ ...items, special: e.target.value })}
                            placeholder="如有未列出的物品，請在此說明"
                            rows={2}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                </div>

                {/* Service Requirements */}
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>🚚 服務需求</h3>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.req_labor}
                                onChange={(e) => setFormData({ ...formData, req_labor: e.target.checked })}
                            />
                            <span>需要搬運服務（司機協助搬運）</span>
                        </label>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>備註</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="其他需求或注意事項"
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                </div>

                {/* Price Preview */}
                <div className="card" style={{
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: '#F0FDF4',
                    border: '2px solid #86EFAC'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>💰 預估費用</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16A34A' }}>
                        NT$ {estimatedPrice}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                        * 實際費用以司機報價為準
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || totalItems === 0}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        opacity: (loading || totalItems === 0) ? 0.5 : 1,
                        cursor: (loading || totalItems === 0) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? '創建中...' : '發布訂單'}
                </button>
            </form>
        </div>
    );
}
