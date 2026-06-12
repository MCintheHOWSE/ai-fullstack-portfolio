import React, { useState } from 'react';
import { STANDARD_ITEMS } from '../utils/priceCalculator';

export default function VerificationModal({ delivery, onClose, onSubmit }) {
    const [itemsMatch, setItemsMatch] = useState(true);
    const [checkedItems, setCheckedItems] = useState({});
    const [verificationNote, setVerificationNote] = useState('');
    const [renegotiationPrice, setRenegotiationPrice] = useState('');
    const [renegotiationReason, setRenegotiationReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    let items = {};
    try {
        items = JSON.parse(delivery.items_json || '{}');
    } catch (e) {
        console.error('Failed to parse items_json:', e);
    }

    const handleItemCheck = (itemKey, checked) => {
        setCheckedItems(prev => ({ ...prev, [itemKey]: checked }));
    };

    const handleSubmit = async () => {
        if (!itemsMatch) {
            if (!renegotiationPrice || !renegotiationReason) {
                alert('請填寫新報價和原因');
                return;
            }
        }

        setSubmitting(true);
        await onSubmit({
            items_match: itemsMatch,
            verification_note: verificationNote || (itemsMatch ? '物品核對無誤' : '物品與描述不符'),
            renegotiation_price: itemsMatch ? null : parseFloat(renegotiationPrice),
            renegotiation_reason: itemsMatch ? null : renegotiationReason
        });
        setSubmitting(false);
    };

    const allItemsChecked = Object.entries(items)
        .filter(([key, count]) => key !== 'special' && count > 0)
        .every(([key]) => checkedItems[key]);

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
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                    📋 現場核對物品
                </h2>

                {/* Item Checklist */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>物品清單</h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {Object.entries(items)
                            .filter(([key, count]) => key !== 'special' && count > 0)
                            .map(([key, count]) => {
                                const item = STANDARD_ITEMS[key];
                                return item ? (
                                    <label key={key} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.75rem',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: checkedItems[key] ? '#F0F9FF' : '#fff'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={checkedItems[key] || false}
                                            onChange={(e) => handleItemCheck(key, e.target.checked)}
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                        <span style={{ flex: 1, fontWeight: '500' }}>{item.name}</span>
                                        <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>x{count}</span>
                                    </label>
                                ) : null;
                            })}
                    </div>
                </div>

                {/* Match Status */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>核對結果</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setItemsMatch(true)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '8px',
                                border: itemsMatch ? '2px solid #10B981' : '1px solid #E5E7EB',
                                backgroundColor: itemsMatch ? '#D1FAE5' : '#fff',
                                color: itemsMatch ? '#065F46' : '#6B7280',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            ✅ 物品相符
                        </button>
                        <button
                            onClick={() => setItemsMatch(false)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '8px',
                                border: !itemsMatch ? '2px solid #EF4444' : '1px solid #E5E7EB',
                                backgroundColor: !itemsMatch ? '#FEE2E2' : '#fff',
                                color: !itemsMatch ? '#991B1B' : '#6B7280',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            ❌ 物品不符
                        </button>
                    </div>
                </div>

                {/* Verification Note */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        核對備註
                    </label>
                    <textarea
                        value={verificationNote}
                        onChange={(e) => setVerificationNote(e.target.value)}
                        placeholder="記錄核對情況..."
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Renegotiation Section (only if items don't match) */}
                {!itemsMatch && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#FEF3C7',
                        borderRadius: '8px',
                        border: '1px solid #FDE68A',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#92400E' }}>
                            💰 重新議價
                        </h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                新報價 (NT$)
                            </label>
                            <input
                                type="number"
                                value={renegotiationPrice}
                                onChange={(e) => setRenegotiationPrice(e.target.value)}
                                placeholder="輸入新的價格"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                議價原因
                            </label>
                            <textarea
                                value={renegotiationReason}
                                onChange={(e) => setRenegotiationReason(e.target.value)}
                                placeholder="說明為何需要調整價格..."
                                rows={3}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            backgroundColor: '#fff',
                            cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || (!itemsMatch && (!renegotiationPrice || !renegotiationReason))}
                        className="btn btn-primary"
                        style={{
                            flex: 1,
                            padding: '1rem',
                            opacity: (submitting || (!itemsMatch && (!renegotiationPrice || !renegotiationReason))) ? 0.5 : 1,
                            cursor: (submitting || (!itemsMatch && (!renegotiationPrice || !renegotiationReason))) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting ? '提交中...' : (itemsMatch ? '確認無誤，開始搬運' : '提交議價')}
                    </button>
                </div>
            </div>
        </div>
    );
}
