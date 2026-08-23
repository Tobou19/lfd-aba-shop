import React from 'react';

interface BrandHeaderProps {
  className?: string;
}

export const BrandHeader = ({ className = '' }: BrandHeaderProps) => {
  return (
    <div className={`brand-header ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
    }}>
      {/* Logo LFD-Services */}
      <img
        src="/images/lfd-logo.png"
        alt="LFD-Services Logo"
        style={{
          width: '80px',
          height: '80px',
          objectFit: 'contain',
        }}
        onError={(e) => {
          // Fallback si l'image n'existe pas encore
          const target = e.target as HTMLImageElement;
          target.src = '/images/lfd-logo.svg';
        }}
      />
      
      {/* Texte du nom */}
      <div>
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'var(--primary-color)',
        }}>
          LFD-Services
        </h1>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: '14px',
          color: 'var(--text-secondary)',
        }}>
          ABA SHOP
        </p>
      </div>
    </div>
  );
};