import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ title, description, icon, link, color }) => {
    return (
        <div className="card flex-col gap-sm" style={{ flex: 1, minWidth: '280px' }}>
            <div style={{
                fontSize: '3rem',
                color: color || 'var(--color-primary)',
                marginBottom: 'var(--spacing-xs)'
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{title}</h3>
            <p style={{ color: 'var(--color-text-light)', flex: 1 }}>{description}</p>
            <Link to={link} className="btn btn-outline text-center" style={{ marginTop: 'var(--spacing-md)' }}>
                前往服務
            </Link>
        </div>
    );
};

export default ServiceCard;
