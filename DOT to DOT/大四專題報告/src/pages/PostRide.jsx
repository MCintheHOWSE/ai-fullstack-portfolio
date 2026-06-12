import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PostRide() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    origin: '外雙溪校區',
    destination: '捷運士林站',
    departureTime: '',
    seats: 3,
    price: 20,
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.id) {
      alert('偵測到您的登入資訊不完整 (缺少 ID)。\n系統將自動登出，請重新登入以修復此問題。');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }

    // Debug: Show full user object
    alert('Debug User Object: ' + JSON.stringify(user));

    try {
      const payload = {
        ...formData,
        driver: user.name || '我 (目前使用者)',
        user_id: user.id
      };

      const response = await fetch('http://localhost:3000/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('行程發布成功！');
        navigate('/search');
      } else {
        alert('發布失敗，請稍後再試。');
      }
    } catch (error) {
      console.error('Error posting ride:', error);
      alert('發生錯誤');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '800px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>提供共乘</h2>
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
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>出發時間</label>
            <input
              type="datetime-local"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div className="flex gap-md">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>提供座位數</label>
              <input
                type="number"
                name="seats"
                min="1"
                max="6"
                value={formData.seats}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>每人費用 (TWD)</label>
              <input
                type="number"
                name="price"
                min="0"
                step="5"
                value={formData.price}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>備註 (選填)</label>
            <textarea
              name="notes"
              rows="3"
              placeholder="例如：只載女生、不菸..."
              value={formData.notes}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            ></textarea>
          </div>

          <button type="button" onClick={handleSubmit} className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>
            發布行程
          </button>
        </form>
      </div>
    </div>
  );
}
