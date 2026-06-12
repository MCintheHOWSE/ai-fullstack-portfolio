import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PostErrand = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        item: '',
        shop_location: '',
        meet_location: '',
        price: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('請先登入');
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);

        try {
            const response = await fetch('/api/errands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    user_id: user.id,
                    price: parseInt(formData.price)
                }),
            });

            if (response.ok) {
                alert('任務發布成功！');
                navigate('/delivery');
            } else {
                const data = await response.json();
                alert(data.error || '發布失敗');
            }
        } catch (error) {
            console.error('Error posting errand:', error);
            alert('發生錯誤，請稍後再試');
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '600px' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#C8102E' }}>發布跑腿任務</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>想要買什麼 / 做什麼？</label>
                        <input
                            type="text"
                            name="item"
                            value={formData.item}
                            onChange={handleChange}
                            placeholder="例如：50嵐 1號珍奶、幫忙印講義"
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>購買地點 / 任務地點</label>
                        <input
                            type="text"
                            name="shop_location"
                            value={formData.shop_location}
                            onChange={handleChange}
                            placeholder="例如：學校對面50嵐、B棟影印店"
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>面交地點</label>
                        <input
                            type="text"
                            name="meet_location"
                            value={formData.meet_location}
                            onChange={handleChange}
                            placeholder="例如：圖書館門口、R棟一樓"
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>總金額 (物品費用 + 跑腿費)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="例如：50"
                                required
                                min="0"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/delivery')}
                            className="btn"
                            style={{ flex: 1, backgroundColor: '#f3f4f6', color: '#374151' }}
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                        >
                            發布任務
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostErrand;
