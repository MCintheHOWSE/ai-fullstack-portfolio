import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateGroupBuy() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [loading, setLoading] = useState(false);
    const [menuPhoto, setMenuPhoto] = useState(null);
    const [menuPhotoPreview, setMenuPhotoPreview] = useState(null);

    const [formData, setFormData] = useState({
        runner_id: user?.id || '',
        type: 'group',
        store_name: '',
        store_location: '',
        delivery_fee: '',
        max_orders: 5,
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

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Convert to Base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setMenuPhoto(base64String);
                setMenuPhotoPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                menu_photo_url: menuPhoto,
                delivery_fee: parseInt(formData.delivery_fee),
                max_orders: parseInt(formData.max_orders)
            };

            const response = await fetch('/api/group-buys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.message === 'success') {
                // Navigate to the created group buy detail page
                navigate(`/group-buy/${data.data.id}`);
            } else {
                alert(data.error || '創建失敗');
            }
        } catch (error) {
            console.error('Error creating group buy:', error);
            alert('創建失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    // Set default deadline to 2 hours from now
    React.useEffect(() => {
        const now = new Date();
        now.setHours(now.getHours() + 2);
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
                    <h1 className="hero-greeting">🛒 發起團購</h1>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        設定團購資訊，開始收單
                    </p>
                </div>
            </section>

            <section style={{ padding: '1rem', paddingBottom: '5rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Store Info */}
                    <div className="card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                            📍 店家資訊
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                店家名稱 *
                            </label>
                            <input
                                type="text"
                                name="store_name"
                                value={formData.store_name}
                                onChange={handleInputChange}
                                placeholder="例：麥當勞、豪大大雞排"
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
                                店家地點 *
                            </label>
                            <input
                                type="text"
                                name="store_location"
                                value={formData.store_location}
                                onChange={handleInputChange}
                                placeholder="例：士林夜市、外雙溪麥當勞"
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

                    {/* Menu Photo */}
                    <div className="card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                            📸 菜單照片（選填）
                        </h3>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            style={{ marginBottom: '1rem' }}
                        />

                        {menuPhotoPreview && (
                            <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                                <img
                                    src={menuPhotoPreview}
                                    alt="菜單預覽"
                                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                                />
                            </div>
                        )}

                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 0' }}>
                            💡 上傳菜單照片讓跟團者更容易點餐
                        </p>
                    </div>

                    {/* Order Settings */}
                    <div className="card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                            ⚙️ 團購設定
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                運費（每份）*
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
                                    placeholder="20"
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
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                限額（最多幾單）*
                            </label>
                            <input
                                type="number"
                                name="max_orders"
                                value={formData.max_orders}
                                onChange={handleInputChange}
                                min="1"
                                max="20"
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
                                截止時間 *
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
                    </div>

                    {/* Additional Info */}
                    <div className="card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                            📝 其他資訊
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
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

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                備註
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="其他注意事項..."
                                rows="3"
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
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.1rem',
                            fontWeight: '600'
                        }}
                    >
                        {loading ? '創建中...' : '🚀 發起團購'}
                    </button>
                </form>
            </section>
        </div>
    );
}
