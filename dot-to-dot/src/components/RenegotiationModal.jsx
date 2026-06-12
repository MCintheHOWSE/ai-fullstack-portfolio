import React, { useState } from 'react';

export default function RenegotiationModal({ delivery, onClose, onRespond }) {
    const [responding, setResponding] = useState(false);

    const handleRespond = async (accept) => {
        if (accept || window.confirm('拒絕議價將取消訂單，確定要拒絕嗎？')) {
            setResponding(true);
            await onRespond(accept);
            setResponding(false);
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                    💰 價格重新協商
                </h2>

                <div style={{
                    padding: '1rem',
                    backgroundColor: '#FEF3C7',
                    borderRadius: '8px',
                    border: '1px solid #FDE68A',
                    marginBottom: '1.5rem'
                }}>
                    <p style={{ marginBottom: '0.5rem', color: '#92400E' }}>
                        <strong>司機提出新報價</strong>
                    </p>
                    <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '1rem' }}>
                        現場核對後發現物品與描述有所差異，司機重新評估報價。
                    </p>
                </div>

                {/* Price Comparison */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.25rem' }}>原報價</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6B7280' }}>
                                NT$ {delivery.quoted_price || delivery.estimated_price}
                            </div>
                        </div>
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#FEF3C7',
                            borderRadius: '8px',
                            textAlign: 'center',
                            border: '2px solid #FBBF24'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#92400E', marginBottom: '0.25rem' }}>新報價</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#D97706' }}>
                                NT$ {delivery.renegotiation_price}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                    }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            調整原因：
                        </div>
                        <div style={{ fontSize: '0.95rem', color: '#666' }}>
                            {delivery.renegotiation_reason}
                        </div>
                    </div>
                </div>

                {delivery.verification_note && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#F0F9FF',
                        borderRadius: '8px',
                        border: '1px solid #BFDBFE',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            核對備註：
                        </div>
                        <div style={{ fontSize: '0.95rem', color: '#666' }}>
                            {delivery.verification_note}
                        </div>
                    </div>
                )}

                {/* Warning */}
                <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#FEE2E2',
                    borderRadius: '8px',
                    border: '1px solid #FCA5A5',
                    marginBottom: '1.5rem'
                }}>
                    <p style={{ fontSize: '0.9rem', color: '#991B1B' }}>
                        ⚠️ <strong>注意：</strong>拒絕議價將自動取消此訂單
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => handleRespond(false)}
                        disabled={responding}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #FCA5A5',
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            fontWeight: 'bold',
                            cursor: responding ? 'not-allowed' : 'pointer'
                        }}
                    >
                        拒絕（取消訂單）
                    </button>
                    <button
                        onClick={() => handleRespond(true)}
                        disabled={responding}
                        className="btn btn-primary"
                        style={{
                            flex: 1,
                            padding: '1rem',
                            fontWeight: 'bold',
                            cursor: responding ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {responding ? '處理中...' : '接受新報價'}
                    </button>
                </div>

                <button
                    onClick={onClose}
                    disabled={responding}
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: 'none',
                        border: 'none',
                        color: '#6B7280',
                        cursor: responding ? 'not-allowed' : 'pointer'
                    }}
                >
                    稍後決定
                </button>
            </div>
        </div>
    );
}
