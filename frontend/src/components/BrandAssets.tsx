import React from 'react';

interface BrandAssetsProps {
  showQRCode?: boolean;
  showCenterPhoto?: boolean;
  className?: string;
}

export const BrandAssets = ({ 
  showQRCode = true, 
  showCenterPhoto = true,
  className = '' 
}: BrandAssetsProps) => {
  return (
    <div className={`brand-assets ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px',
      alignItems: 'center',
    }}>
      {/* Photo du Centre */}
      {showCenterPhoto && (
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <img
            src="/images/center-photo.jpg"
            alt="Centre LFD-Services"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: 'var(--shadow)',
            }}
            onError={(e) => {
              // Fallback si l'image n'existe pas encore
              const target = e.target as HTMLImageElement;
              target.src = '/images/center-photo.svg';
            }}
          />
          <p style={{
            textAlign: 'center',
            marginTop: '8px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}>
            Notre Centre LFD-Services
          </p>
        </div>
      )}

      {/* QR Code de la Boutique */}
      {showQRCode && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '24px',
          backgroundColor: 'var(--surface-color)',
          borderRadius: '8px',
          border: '2px solid var(--primary-color)',
        }}>
          <img
            src="/images/qr-code-shop.png"
            alt="QR Code Boutique LFD-Services"
            style={{
              width: '200px',
              height: '200px',
              objectFit: 'contain',
            }}
            onError={(e) => {
              // Fallback si l'image n'existe pas encore
              const target = e.target as HTMLImageElement;
              target.src = '/images/qr-code-shop.svg';
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'var(--primary-color)',
            }}>
              Scannez pour Accéder à la Boutique
            </p>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>
              LFD-Services ABA SHOP
            </p>
          </div>
        </div>
      )}
    </div>
  );
};