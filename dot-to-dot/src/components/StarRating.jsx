import React, { useState } from 'react';

const StarRating = ({ rating, onRate, readonly = false }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseMove = (e, index) => {
        if (readonly) return;
        const rect = e.target.getBoundingClientRect();
        const isHalf = e.clientX - rect.left < rect.width / 2;
        setHoverRating(index + (isHalf ? 0.5 : 1));
    };

    const handleClick = () => {
        if (readonly) return;
        onRate(hoverRating);
    };

    const renderStar = (index) => {
        const currentRating = hoverRating || rating;
        const isFull = currentRating >= index + 1;
        const isHalf = currentRating >= index + 0.5 && currentRating < index + 1;

        return (
            <span
                key={index}
                style={{
                    cursor: readonly ? 'default' : 'pointer',
                    fontSize: '24px',
                    color: isFull || isHalf ? '#FFD700' : '#e4e5e9',
                    position: 'relative',
                    display: 'inline-block'
                }}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={handleClick}
            >
                {/* Background Star (Gray) */}
                <span style={{ color: '#e4e5e9' }}>★</span>

                {/* Foreground Star (Gold) - Clipped for Half Star */}
                <span style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    color: '#FFD700',
                    width: isFull ? '100%' : isHalf ? '50%' : '0%',
                    overflow: 'hidden',
                    pointerEvents: 'none'
                }}>★</span>
            </span>
        );
    };

    return (
        <div style={{ display: 'inline-flex' }}>
            {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
            {!readonly && <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>{hoverRating || rating}</span>}
        </div>
    );
};

export default StarRating;
