import { useState } from 'react';

const PostDeliveryForm = ({ onClose, onSuccess }) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        item_type: 'package',
        item_description: '',
        required_vehicle: 'motorcycle',
        price: '',
        pickup_time: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.origin || !formData.destination || !formData.item_description || !formData.price) {
            alert('請填寫所有必填欄位');
            return;
        }

        try {
            const response = await fetch('/api/deliveries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    ...formData,
                    price: parseFloat(formData.price)
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('配送需求發布成功！');
                onSuccess(data.data);
                onClose();
            } else {
                alert(data.error || '發布失敗');
            }
        } catch (error) {
            console.error('Error posting delivery:', error);
            alert('發生錯誤，請稍後再試');
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
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📦 發布配送需求</h2>
                    <button onClick={onClose} style={{ fontSize: '1.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {/* Origin */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            起點地址 <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="origin"
                            value={formData.origin}
                            onChange={handleChange}
                            placeholder="例：楓雅樓 3F"
                            list="origin-options"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                            required
                        />
                        <datalist id="origin-options">
                            <option value="楓雅樓" />
                            <option value="松勁樓" />
                            <option value="榕華樓" />
                            <option value="外雙溪校區" />
                            <option value="城中校區" />
                        </datalist>
                    </div>

                    {/* Destination */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            終點地址 <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            placeholder="例：城中校區"
                            list="destination-options"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                            required
                        />
                        <datalist id="destination-options">
                            <option value="外雙溪校區" />
                            <option value="城中校區" />
                            <option value="捷運士林站" />
                            <option value="捷運劍潭站" />
                            <option value="台北車站" />
                        </datalist>
                    </div>

                    {/* Item Type */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            貨物類型 <span style={{ color: 'red' }}>*</span>
                        </label>
                        <select
                            name="item_type"
                            value={formData.item_type}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                        >
                            <option value="package">📦 包裹/文件</option>
                            <option value="food">🍔 外送/代購</option>
                            <option value="furniture">🛋️ 家具/家電</option>
                            <option value="moving">🏠 宿舍搬遷</option>
                        </select>
                    </div>

                    {/* Item Description */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            貨物描述 <span style={{ color: 'red' }}>*</span>
                        </label>
                        <textarea
                            name="item_description"
                            value={formData.item_description}
                            onChange={handleChange}
                            placeholder="例：2個行李箱 + 書桌椅"
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                resize: 'vertical'
                            }}
                            required
                        />
                    </div>

                    {/* Required Vehicle */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            需求車型 <span style={{ color: 'red' }}>*</span>
                        </label>
                        <select
                            name="required_vehicle"
                            value={formData.required_vehicle}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                        >
                            <option value="motorcycle">🏍️ 機車 (小包裹)</option>
                            <option value="car">🚗 轎車 (中型貨物)</option>
                            <option value="van">🚐 廂型車 (大型物品)</option>
                            <option value="truck">🚚 貨車 (整套搬家)</option>
                        </select>
                    </div>

                    {/* Price */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            願付金額 (NT$) <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="例：600"
                            min="0"
                            step="10"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                            required
                        />
                    </div>

                    {/* Pickup Time */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            希望取件時間 (選填)
                        </label>
                        <input
                            type="datetime-local"
                            name="pickup_time"
                            value={formData.pickup_time}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB'
                            }}
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            備註 (選填)
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="例：請提前5分鐘到，謝謝"
                            rows="2"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            發布需求
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostDeliveryForm;
