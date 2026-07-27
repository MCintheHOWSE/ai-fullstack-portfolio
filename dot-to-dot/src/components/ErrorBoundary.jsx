import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('Dot to Dot render error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    textAlign: 'center',
                    fontFamily: 'system-ui, sans-serif',
                }}>
                    <h1 style={{ color: '#C8102E', marginBottom: '0.5rem' }}>Dot to Dot</h1>
                    <p style={{ color: '#444', marginBottom: '1.5rem' }}>頁面載入時發生錯誤</p>
                    <button
                        type="button"
                        onClick={() => {
                            try {
                                localStorage.removeItem('user');
                            } catch {
                                /* ignore */
                            }
                            window.location.href = '/';
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#C8102E',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                        }}
                    >
                        清除快取並重新載入
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
