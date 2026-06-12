import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditErrand = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        item: '',
        shop_location: '',
        meet_location: '',
        price: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchErrandDetails();
    }, [id]);

    const fetchErrandDetails = async () => {
        try {
            const response = await fetch('/api/errands');
            const data = await response.json();
            if (response.ok) {
                const errand = data.data.find(e => e.id == id);
                if (errand) {
                    setFormData({
                        item: errand.item,
                        shop_location: errand.shop_location,
                        meet_location: errand.meet_location,
                        price: errand.price
                    });
                } else {
                    alert('找不到該任務');
                    navigate('/profile');
                }
            }
        } catch (error) {
            console.error('Error fetching errand:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/errands/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert('任務更新成功！');
                navigate('/profile');
            } else {
                alert(data.error || '更新失敗');
            }
        } catch (error) {
            console.error('Error updating errand:', error);
            alert('發生錯誤，請稍後再試');
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>載入中...</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', color: '#1F2937' }}>編輯跑腿任務</h2>

            <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>想要買什麼 / 做什麼？</label>
                    <input
                        type="text"
                        name="item"
                        value={formData.item}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>購買地點 / 任務地點</label>
                    <input
                        type="text"
                        name="shop_location"
                        value={formData.shop_location}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>面交地點</label>
                    <input
                        type="text"
                        name="meet_location"
                        value={formData.meet_location}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>總金額 (物品費用 + 跑腿費)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="btn"
                        style={{ flex: 1, backgroundColor: '#E5E7EB', color: '#374151' }}
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                    >
                        儲存修改
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditErrand;
