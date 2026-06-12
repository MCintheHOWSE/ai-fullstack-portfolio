import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [showRideSelection, setShowRideSelection] = useState(false);

    const handleServiceClick = (link) => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (link === '/ride-split') {
            setShowRideSelection(true);
        } else {
            navigate(link);
        }
    };

    return (
        <div className="home-container mobile-first">
            {/* Simplified Hero - Mobile First */}
            <section className="hero-section-mobile">
                <div className="container">
                    <h1 className="hero-greeting">
                        你好，{user ? user.name : '同學'}！
                    </h1>
                </div>
            </section>

            {/* Large Service Cards - Mobile Optimized */}
            <section className="service-section-mobile">
                <div className="service-cards-mobile">
                    <ServiceCardMobile
                        icon="🚗"
                        title="共乘服務"
                        subtitle="順路往返雙校區"
                        description="外雙溪⇄城中校區，共乘省錢又環保。"
                        link="/ride-split"
                        onServiceClick={handleServiceClick}
                    />
                    <ServiceCardMobile
                        icon="📦"
                        title="校園物流"
                        subtitle="搬宿、大型物品運送"
                        description="宿舍搬遷、大型家具，輕鬆媒合運送夥伴。"
                        link="/logistics"
                        onServiceClick={handleServiceClick}
                    />
                    <ServiceCardMobile
                        icon="🍔"
                        title="餐飲跑腿"
                        subtitle="順路代購、團購美食"
                        description="不想出門？讓順路的同學幫你跑腿吧！"
                        link="/food-delivery"
                        onServiceClick={handleServiceClick}
                    />
                </div>
            </section>

            {/* Ride Selection Modal */}
            {showRideSelection && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#1a1a1a' }}>今天想怎麼移動？</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ padding: '1rem', fontSize: '1.1rem' }}
                                onClick={() => navigate('/find-passengers')}
                            >
                                🚗 我是駕駛 (我要載人)
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 'normal' }}>
                                    分享空位，賺點油錢或交朋友
                                </div>
                            </button>
                            <button
                                className="btn"
                                style={{ padding: '1rem', fontSize: '1.1rem', backgroundColor: '#e2e8f0', color: '#1e293b' }}
                                onClick={() => navigate('/post-request')}
                            >
                                🙋‍♂️ 我是乘客 (我要搭車)
                                <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 'normal' }}>
                                    尋找順路車，輕鬆往返校區
                                </div>
                            </button>
                            <button
                                className="btn"
                                style={{ marginTop: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'transparent', color: '#64748b' }}
                                onClick={() => setShowRideSelection(false)}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ServiceCardMobile({ icon, title, subtitle, description, link, onServiceClick }) {
    return (
        <div
            className="service-card-mobile"
            onClick={() => onServiceClick(link)}
        >
            <div className="service-icon-mobile">{icon}</div>
            <div className="service-content-mobile">
                <h3 className="service-title-mobile">{title}</h3>
                <p className="service-subtitle-mobile">{subtitle}</p>
                <p className="service-description-mobile">{description}</p>
            </div>
        </div>
    );
}
