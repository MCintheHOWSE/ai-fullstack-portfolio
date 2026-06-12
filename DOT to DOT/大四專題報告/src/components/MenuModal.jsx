import React, { useState } from 'react';

const MenuModal = ({ restaurant, onClose, onAddToCart }) => {
    const [cart, setCart] = useState({});

    // Generate menu items based on restaurant category
    const getMenuItems = () => {
        if (restaurant.category.includes('便當')) {
            return [
                { id: 1, name: '招牌便當', price: 80, category: '便當', description: '主菜+三樣配菜+白飯' },
                { id: 2, name: '雞腿便當', price: 100, category: '便當', description: '香嫩雞腿+三樣配菜+白飯' },
                { id: 3, name: '排骨便當', price: 90, category: '便當', description: '酥脆排骨+三樣配菜+白飯' },
                { id: 4, name: '炸雞便當', price: 95, category: '便當', description: '炸雞+三樣配菜+白飯' },
                { id: 5, name: '素食便當', price: 75, category: '便當', description: '健康素食+三樣配菜+白飯' }
            ];
        } else if (restaurant.category.includes('麵食')) {
            return [
                { id: 1, name: '牛肉麵', price: 120, category: '麵食', description: '濃郁湯頭+軟嫩牛肉' },
                { id: 2, name: '排骨麵', price: 110, category: '麵食', description: '大塊排骨+Q彈麵條' },
                { id: 3, name: '餛飩麵', price: 90, category: '麵食', description: '手工餛飩+細麵' },
                { id: 4, name: '乾麵', price: 60, category: '麵食', description: '香蔥油麵' },
                { id: 5, name: '湯麵', price: 70, category: '麵食', description: '清湯麵' },
                { id: 6, name: '紅茶', price: 25, category: '飲料', description: '古早味紅茶' }
            ];
        } else if (restaurant.category.includes('早午餐')) {
            return [
                { id: 1, name: '火腿蛋吐司', price: 45, category: '早餐', description: '新鮮火腿+太陽蛋' },
                { id: 2, name: '培根蛋餅', price: 50, category: '早餐', description: '酥脆蛋餅+培根' },
                { id: 3, name: '鮪魚三明治', price: 55, category: '早餐', description: '新鮮鮪魚沙拉' },
                { id: 4, name: '起司蛋餅', price: 50, category: '早餐', description: '濃郁起司+蛋餅' },
                { id: 5, name: '蘿蔔糕', price: 35, category: '早餐', description: '香煎蘿蔔糕' },
                { id: 6, name: '奶茶', price: 35, category: '飲料', description: '香濃奶茶' },
                { id: 7, name: '豆漿', price: 25, category: '飲料', description: '新鮮豆漿' }
            ];
        } else if (restaurant.category.includes('飲料')) {
            return [
                { id: 1, name: '美式咖啡', price: 65, category: '咖啡', description: '經典美式黑咖啡' },
                { id: 2, name: '拿鐵咖啡', price: 85, category: '咖啡', description: '香醇拿鐵' },
                { id: 3, name: '卡布奇諾', price: 90, category: '咖啡', description: '綿密奶泡' },
                { id: 4, name: '焦糖瑪奇朵', price: 100, category: '咖啡', description: '香甜焦糖風味' },
                { id: 5, name: '抹茶拿鐵', price: 95, category: '茶飲', description: '濃郁抹茶香' },
                { id: 6, name: '經典可頌', price: 55, category: '輕食', description: '法式奶油可頌' },
                { id: 7, name: '火腿起司帕尼尼', price: 110, category: '輕食', description: '熱壓三明治' },
                { id: 8, name: '提拉米蘇', price: 85, category: '甜點', description: '經典義式甜點' }
            ];
        } else if (restaurant.category.includes('雞排')) {
            return [
                { id: 1, name: '豪大大雞排', price: 65, category: '炸物', description: '外酥內嫩，比臉大' },
                { id: 2, name: '鹽酥雞', price: 60, category: '炸物', description: '酥脆鹹香' },
                { id: 3, name: '雞塊', price: 50, category: '炸物', description: '一口大小，方便食用' },
                { id: 4, name: '薯條', price: 40, category: '炸物', description: '黃金薯條' },
                { id: 5, name: '甜不辣', price: 45, category: '炸物', description: '口感Q彈' },
                { id: 6, name: '米血糕', price: 35, category: '炸物', description: '台式經典' },
                { id: 7, name: '四季豆', price: 40, category: '炸物', description: '清脆爽口' },
                { id: 8, name: '珍珠奶茶', price: 50, category: '飲料', description: '大杯，可調甜度' }
            ];
        } else if (restaurant.category.includes('速食')) {
            return [
                { id: 1, name: '大麥克', price: 95, category: '漢堡', description: '經典雙層牛肉堡' },
                { id: 2, name: '麥香雞', price: 75, category: '漢堡', description: '香脆炸雞排堡' },
                { id: 3, name: '勁辣雞腿堡', price: 85, category: '漢堡', description: '辣味炸雞腿堡' },
                { id: 4, name: '麥克雞塊 (6塊)', price: 65, category: '炸物', description: '金黃酥脆雞塊' },
                { id: 5, name: '薯條 (大)', price: 50, category: '炸物', description: '香脆薯條' },
                { id: 6, name: '麥克冰炫風', price: 60, category: '甜點', description: 'OREO/M&M' },
                { id: 7, name: '可樂 (中)', price: 35, category: '飲料', description: '冰涼可樂' },
                { id: 8, name: '快樂兒童餐', price: 120, category: '套餐', description: '含漢堡+薯條+飲料+玩具' }
            ];
        } else if (restaurant.category.includes('咖啡') || restaurant.name.includes('星巴克')) {
            return [
                { id: 1, name: '美式咖啡', price: 90, category: '咖啡', description: '經典黑咖啡' },
                { id: 2, name: '焦糖瑪奇朵', price: 135, category: '咖啡', description: '香甜焦糖風味' },
                { id: 3, name: '拿鐵', price: 120, category: '咖啡', description: '經典義式拿鐵' },
                { id: 4, name: '抹茶那堤', price: 130, category: '茶飲', description: '濃郁抹茶' },
                { id: 5, name: '星冰樂', price: 140, category: '冰沙', description: '摩卡/焦糖/抹茶' },
                { id: 6, name: '經典美式鬆餅', price: 110, category: '輕食', description: '手工鬆餅' },
                { id: 7, name: '起司火腿可頌', price: 85, category: '輕食', description: '溫熱可頌' },
                { id: 8, name: '紐約起司蛋糕', price: 95, category: '甜點', description: '濃郁起司香' }
            ];
        } else {
            // 預設菜單（炸物、其他）
            return [
                { id: 1, name: '炸雞塊', price: 60, category: '炸物', description: '酥脆多汁，6塊' },
                { id: 2, name: '薯條', price: 40, category: '炸物', description: '黃金薯條' },
                { id: 3, name: '雞米花', price: 55, category: '炸物', description: '一口大小，方便食用' },
                { id: 4, name: '雞翅', price: 70, category: '炸物', description: '香辣雞翅，3支' },
                { id: 5, name: '洋蔥圈', price: 50, category: '炸物', description: '酥脆洋蔥圈' },
                { id: 6, name: '可樂', price: 30, category: '飲料', description: '冰涼可樂' }
            ];
        }
    };

    const menuItems = getMenuItems();

    const updateQuantity = (itemId, change) => {
        setCart(prev => {
            const newCart = { ...prev };
            const currentQty = newCart[itemId] || 0;
            const newQty = Math.max(0, currentQty + change);

            if (newQty === 0) {
                delete newCart[itemId];
            } else {
                newCart[itemId] = newQty;
            }

            return newCart;
        });
    };

    const getTotals = () => {
        let totalItems = 0;
        let totalPrice = 0;

        Object.entries(cart).forEach(([itemId, qty]) => {
            totalItems += qty;
            const item = menuItems.find(i => i.id === parseInt(itemId));
            if (item) {
                totalPrice += item.price * qty;
            }
        });

        return { totalItems, totalPrice };
    };

    const handleAddToCart = () => {
        const { totalItems } = getTotals();
        if (totalItems > 0) {
            // Convert cart object to array of items
            const items = Object.entries(cart).map(([itemId, quantity]) => {
                const item = menuItems.find(i => i.id === parseInt(itemId));
                return {
                    ...item,
                    quantity
                };
            });

            onAddToCart(items, restaurant.name);
            onClose();
        } else {
            alert('請先選擇商品');
        }
    };

    const { totalItems, totalPrice } = getTotals();

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
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="card" style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                padding: 0,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            {restaurant.name}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                            <span>⭐ {restaurant.rating}</span>
                            <span>🕒 {restaurant.time} 分鐘</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#666',
                            padding: '0.5rem'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Menu Items */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {menuItems.map(item => {
                            const quantity = cart[item.id] || 0;
                            return (
                                <div key={item.id} className="card" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{item.name}</h4>
                                            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                                                {item.description}
                                            </p>
                                            <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#C8102E' }}>
                                                NT$ {item.price}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                                            {quantity === 0 ? (
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                >
                                                    加入
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            padding: 0,
                                                            fontSize: '1.2rem',
                                                            borderColor: '#C8102E',
                                                            color: '#C8102E'
                                                        }}
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                    >
                                                        -
                                                    </button>
                                                    <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            padding: 0,
                                                            fontSize: '1.2rem'
                                                        }}
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                    >
                                                        +
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                {totalItems > 0 && (
                    <div style={{
                        padding: '1.5rem',
                        borderTop: '1px solid #E5E7EB',
                        backgroundColor: '#F9FAFB'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                共 {totalItems} 項商品
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#C8102E' }}>
                                NT$ {totalPrice}
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.75rem' }}
                            onClick={handleAddToCart}
                        >
                            加入購物車
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuModal;
