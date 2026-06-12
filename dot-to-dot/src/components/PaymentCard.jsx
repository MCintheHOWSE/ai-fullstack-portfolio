import React, { useState } from 'react';
import { getBankName } from '../utils/encryptionUtils';

/**
 * PaymentCard - Special chat message component for displaying payment info
 * Appears only for the passenger when driver initiates payment
 * 
 * Zero-Knowledge Design:
 * - Payment info transmitted via WebSocket only (ephemeral)
 * - Not stored in chat history
 * - Disappears after transaction complete
 */
export default function PaymentCard({
    amount,
    bankCode,
    accountNumber,
    rideId,
    deliveryId,  // Support for logistics system
    onPaymentSent
}) {
    const [copied, setCopied] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const handleCopyAccount = () => {
        navigator.clipboard.writeText(accountNumber)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {
                alert('複製失敗，請手動複製');
            });
    };

    const handlePaymentSent = () => {
        if (!confirmed) {
            if (window.confirm('確認已完成轉帳？\n點擊確認後將通知駕駛。')) {
                setConfirmed(true);
                if (onPaymentSent) {
                    onPaymentSent(rideId);
                }
            }
        }
    };

    return (
        <div style={{
            backgroundColor: '#FFF9E6',
            border: '2px solid #FFD700',
            borderRadius: '12px',
            padding: '1.25rem',
            margin: '0.75rem 0',
            boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)',
            maxWidth: '100%'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <span style={{ fontSize: '32px', marginRight: '0.5rem' }}>💰</span>
                <div>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: '#856404'
                    }}>
                        收款資訊
                    </h3>
                    <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#856404',
                        opacity: 0.8
                    }}>
                        請使用網銀轉帳或現金支付
                    </p>
                </div>
            </div>

            {/* Amount */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '0.75rem'
            }}>
                <label style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    color: '#666',
                    marginBottom: '0.25rem'
                }}>
                    應付金額
                </label>
                <p style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#C8102E'
                }}>
                    NT$ {amount}
                </p>
            </div>

            {/* Bank Info */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '0.75rem'
            }}>
                <label style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    color: '#666',
                    marginBottom: '0.25rem'
                }}>
                    收款銀行
                </label>
                <p style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1a1a1a'
                }}>
                    {getBankName(bankCode)} ({bankCode})
                </p>
            </div>

            {/* Account Number - Clickable */}
            <div
                onClick={handleCopyAccount}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                    border: '2px dashed #FFD700',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FFA500';
                    e.currentTarget.style.backgroundColor = '#FFFEF0';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#FFD700';
                    e.currentTarget.style.backgroundColor = 'white';
                }}
            >
                <label style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    color: '#666',
                    marginBottom: '0.25rem'
                }}>
                    帳號 {copied && <span style={{ color: '#059669' }}>✓ 已複製</span>}
                </label>
                <p style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px'
                }}>
                    {accountNumber}
                </p>
                <p style={{
                    margin: '0.25rem 0 0 0',
                    fontSize: '0.75rem',
                    color: '#999',
                    fontStyle: 'italic'
                }}>
                    點擊即可複製
                </p>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '0.5rem'
            }}>
                <button
                    onClick={handleCopyAccount}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        backgroundColor: 'white',
                        border: '2px solid #FFD700',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: '#856404',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFF9E6';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                    }}
                >
                    📋 複製帳號
                </button>
                <button
                    onClick={handlePaymentSent}
                    disabled={confirmed}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        backgroundColor: confirmed ? '#10B981' : '#C8102E',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: 'white',
                        cursor: confirmed ? 'not-allowed' : 'pointer',
                        opacity: confirmed ? 0.7 : 1,
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        if (!confirmed) {
                            e.currentTarget.style.backgroundColor = '#A00D26';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!confirmed) {
                            e.currentTarget.style.backgroundColor = '#C8102E';
                        }
                    }}
                >
                    {confirmed ? '✓ 已確認付款' : '✅ 我已付款'}
                </button>
            </div>

            {/* Privacy Notice */}
            <div style={{
                marginTop: '0.75rem',
                padding: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#856404',
                textAlign: 'center',
                lineHeight: '1.4'
            }}>
                🔒 此支付資訊僅在您的裝置與對方裝置間傳輸
                <br />
                Dot to Dot 伺服器不留存任何金融資料
            </div>
        </div>
    );
}
