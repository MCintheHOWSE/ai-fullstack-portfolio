import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DeliveryCard from '../components/DeliveryCard';
import PostDeliveryForm from '../components/PostDeliveryForm';

const Logistics = () => {
  const [itemType, setItemType] = useState('all');
  const [vehicleType, setVehicleType] = useState('all');
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetChatId = queryParams.get('chatId');

  // Fetch deliveries from API
  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Filter deliveries when search criteria or deliveries list changes
  useEffect(() => {
    filterDeliveries();
  }, [itemType, vehicleType, deliveries]);

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('/api/deliveries');
      const data = await response.json();

      if (response.ok && data.data) {
        setDeliveries(data.data);
      } else {
        setDeliveries([]);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    let result = deliveries;

    // Filter by item type
    if (itemType !== 'all') {
      result = result.filter(delivery => delivery.item_type === itemType);
    }

    // Filter by vehicle type
    if (vehicleType !== 'all') {
      result = result.filter(delivery => delivery.required_vehicle === vehicleType);
    }

    setFilteredDeliveries(result);
  };

  const handlePostRequest = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      alert('請先登入會員');
      navigate('/login');
    } else {
      setShowPostForm(true);
    }
  };

  const handlePostSuccess = (newDelivery) => {
    setDeliveries([newDelivery, ...deliveries]);
    alert('配送需求發布成功！');
  };

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      {/* Header */}
      <div className="flex justify-between items-end flex-col-mobile items-start-mobile gap-sm-mobile" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📦</span> 校園物流配送
          </h1>
          <p style={{ color: '#666' }}>包裹、外送、搬家，一鍵媒合校園夥伴！</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem' }}
          onClick={handlePostRequest}
        >
          + 發布配送需求
        </button>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>快速篩選</h3>
        <div className="flex gap-md flex-col-mobile">
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>貨物類型</label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#fff'
              }}
            >
              <option value="all">全部</option>
              <option value="package">📦 包裹/文件</option>
              <option value="food">🍔 外送/代購</option>
              <option value="furniture">🛋️ 家具/家電</option>
              <option value="moving">🏠 宿舍搬遷</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>車型需求</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#fff'
              }}
            >
              <option value="all">車型不限</option>
              <option value="motorcycle">🏍️ 機車</option>
              <option value="car">🚗 轎車</option>
              <option value="van">🚐 廂型車</option>
              <option value="truck">🚚 貨車</option>
            </select>
          </div>
        </div>
      </div>

      {/* Delivery List */}
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          {itemType === 'all' ? '所有配送需求' :
            itemType === 'package' ? '包裹配送' :
              itemType === 'food' ? '外送代購' :
                itemType === 'furniture' ? '家具配送' : '搬家服務'}
          {filteredDeliveries.length > 0 && ` (${filteredDeliveries.length})`}
        </h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            載入中...
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>沒有找到符合條件的配送需求</p>
            <p style={{ fontSize: '0.9rem' }}>試試調整搜尋條件或發布第一個需求吧！</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredDeliveries.map(delivery => (
              <DeliveryCard key={delivery.id} delivery={delivery} targetChatId={targetChatId} />
            ))}
          </div>
        )}
      </div>

      {/* Post Form Modal */}
      {showPostForm && (
        <PostDeliveryForm
          onClose={() => setShowPostForm(false)}
          onSuccess={handlePostSuccess}
        />
      )}
    </div>
  );
};

export default Logistics;
