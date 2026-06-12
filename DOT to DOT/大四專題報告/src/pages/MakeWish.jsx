import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MakeWish() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        type: 'wish',
        store_name: '',
        store_location: '',
        delivery_fee: '',
        max_orders: 1,
        deadline: '',
        meet_location: '',
        notes: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                runner_id: null, // Type B starts without a runner
                delivery_fee: parseInt(formData.delivery_fee),
                max_orders: parseInt(formData.max_orders)
            };

            const response = await fetch('http://localhost:3000/api/group-buys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.message === 'success') {
                alert('許願成功！等待跑腿者接單');
                navigate('/food-delivery');
            } else {
                alert(data.error || '許願失敗');
            }
        } catch (error) {
            console.error('Error creating wish:', error);
            alert('許願失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    // Set default deadline to 24 hours from now (for wishes)
    React.useEffect(() => {
        const now = new Date();
        now.setHours(now.getHours() + 24);
        const defaultDeadline = now.toISOString().slice(0, 16);
        setFormData(prev => ({ ...prev, deadline: defaultDeadline }));
    }, []);

    return (
        <div className="home-container mobile-first">
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
                    <h1 className="hero-greeting">💡 發布許願</h1>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        說出你的需求，等待跑腿者接單
                    </p>
                </div>
            </section>

            <section style={{ padding: '1rem', paddingBottom: '5rem' }}>
                {/* Info Alert */}
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    marginBottom: '1.25rem',
                    border: '1px solid #fbbf24'
                }}>
                    <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                        <strong>💡 許願模式說明</strong>
                        <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
                            <li>適合非用餐時段、特殊物品</li>
                            <li>您可以自由出價運費</li>
                            <li>等待熱心跑腿者接單</li>
                        </ul>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Item Info */}
                    <div className="card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                            🎯 需求內容
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                想要什麼？ *
                            </label>
                            <input
                                type="text"
                                name="store_name"
                                value={formData.store_name}
                                onChange={handleInputChange}
                                placeholder="例：感冒藥、炸雞排、珍珠奶茶"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                在哪裡買？ *
                            </label>
                            <input
                                type="text"
                                name="store_location"
                                value={formData.store_location}
                                onChange={handleInputChange}
                                placeholder="例：康是美、麥當勞、全家便利商店"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                            💰 願意出多少運費？
                        </h3>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                運費（出價）*
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>
                                    $
                                </span>
                                <input
                                    type="number"
                                    name="delivery_fee"
                                    value={formData.delivery_fee}
                                    onChange={handleInputChange}
                                    placeholder="60"
                                    min="0"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 1.75rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 0' }}>
                                💡 建議：特殊物品 $50-80，一般餐飲 $30-50
                            </p>
                        </div>
                    </div>

                    {/* Time and Location */}
                    <div className="card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                            🕐 時間與地點
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                需求截止時間 *
                            </label>
                            <input
                                type="datetime-local"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                面交地點
                            </label>
                            <input
                                type="text"
                                name="meet_location"
                                value={formData.meet_location}
                                onChange={handleInputChange}
                                placeholder="例：宿舍大廳、教室樓下"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                            📝 補充說明
                        </h3>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                其他需求或注意事項
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="例：要無糖、不要加料、需要發票..."
                                rows="4"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            backgroundColor: '#f59e0b',
                            color: 'white'
                        }}
                    >
                        {loading ? '發布中...' : '💡 發布許願'}
                    </button>
                </form>
            </section>
        </div>
    );
}
