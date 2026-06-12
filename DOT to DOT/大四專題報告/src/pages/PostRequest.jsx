import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PostRequest() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        origin: '外雙溪校區',
        destination: '捷運士林站',
        passenger_count: 1,
        preferred_vehicle: 'none',
        budget: 50
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (!user || !user.id) {
            alert('請先登入');
            navigate('/login');
            return;
        }

        // Validation: Scooter capacity
        if (formData.preferred_vehicle === 'scooter' && parseInt(formData.passenger_count) > 1) {
            alert('機車只能載 1 人！請重新選擇載具或人數。');
            return;
        }

        try {
            const payload = {
                ...formData,
                user_id: user.id
            };

            const response = await fetch('http://localhost:3000/api/ride-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('需求發布成功！請等待駕駛邀請。');
                navigate('/'); // Ideally navigate to "My Requests" list
            } else {
                alert('發布失敗，請稍後再試。');
            }
        } catch (error) {
            console.error('Error posting request:', error);
            alert('發生錯誤');
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '800px' }}>
            <div className="card">
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>我要搭車 (發布需求)</h2>
                <form className="flex flex-col gap-md">
                    <div className="flex gap-md flex-col-mobile">
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>出發地</label>
                            <select
                                name="origin"
                                value={formData.origin}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            >
                                <option>外雙溪校區</option>
                                <option>城中校區</option>
                                <option>捷運士林站</option>
                                <option>其他</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>目的地</label>
                            <select
                                name="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            >
                                <option>捷運士林站</option>
                                <option>城中校區</option>
                                <option>外雙溪校區</option>
                                <option>其他</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>搭乘人數</label>
                        <select
                            name="passenger_count"
                            value={formData.passenger_count}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>偏好載具</label>
                        <div className="flex gap-md">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="preferred_vehicle"
                                    value="none"
                                    checked={formData.preferred_vehicle === 'none'}
                                    onChange={handleChange}
                                />
                                不限
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="preferred_vehicle"
                                    value="scooter"
                                    checked={formData.preferred_vehicle === 'scooter'}
                                    onChange={handleChange}
                                />
                                指定機車 🛵 (限1人)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="preferred_vehicle"
                                    value="car"
                                    checked={formData.preferred_vehicle === 'car'}
                                    onChange={handleChange}
                                />
                                指定汽車 🚗
                            </label>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>駕駛性別限制</label>
                        <div className="flex gap-md">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="driver_gender_preference"
                                    value="none"
                                    checked={!formData.driver_gender_preference || formData.driver_gender_preference === 'none'}
                                    onChange={handleChange}
                                />
                                不限
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="driver_gender_preference"
                                    value="male"
                                    checked={formData.driver_gender_preference === 'male'}
                                    onChange={handleChange}
                                />
                                限男駕駛 👨
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="driver_gender_preference"
                                    value="female"
                                    checked={formData.driver_gender_preference === 'female'}
                                    onChange={handleChange}
                                />
                                限女駕駛 👩
                            </label>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>願付價格 (預算錨點) TWD</label>
                        <input
                            type="number"
                            name="budget"
                            min="0"
                            step="5"
                            value={formData.budget}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <button type="button" onClick={handleSubmit} className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>
                        送出需求，等待駕駛邀請
                    </button>
                </form>
            </div>
        </div>
    );
}
