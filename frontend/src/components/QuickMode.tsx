import { useState } from 'react';

interface QuickAction {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  color: string;
}

interface QuickModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickMode = ({ isOpen, onClose }: QuickModeProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const quickActions: QuickAction[] = [
    {
      id: 'new-order',
      name: 'Nouvelle Commande',
      icon: '📋',
      shortcut: 'Ctrl+N',
      action: () => console.log('Nouvelle commande'),
      color: '#4CAF50',
    },
    {
      id: 'new-customer',
      name: 'Nouveau Client',
      icon: '👤',
      shortcut: 'Ctrl+C',
      action: () => console.log('Nouveau client'),
      color: '#2196F3',
    },
    {
      id: 'quick-scan',
      name: 'Scan QR Code',
      icon: '📱',
      shortcut: 'Ctrl+Q',
      action: () => console.log('Scan QR'),
      color: '#FF9800',
    },
    {
      id: 'today-orders',
      name: 'Commandes du Jour',
      icon: '📅',
      shortcut: 'Ctrl+D',
      action: () => console.log('Commandes du jour'),
      color: '#9C27B0',
    },
    {
      id: 'quick-pay',
      name: 'Paiement Rapide',
      icon: '💳',
      shortcut: 'Ctrl+P',
      action: () => console.log('Paiement rapide'),
      color: '#E91E63',
    },
    {
      id: 'stock-check',
      name: 'Vérifier Stock',
      icon: '📦',
      shortcut: 'Ctrl+S',
      action: () => console.log('Vérifier stock'),
      color: '#607D8B',
    },
  ];

  const filteredActions = quickActions.filter(action =>
    action.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--surface-color)',
          padding: '24px',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>⚡ Mode Rapide</h2>
          <button
            onClick={onClose}
            style={{
              padding: '4px 8px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une action rapide..."
          autoFocus
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '16px',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--background-color)',
            color: 'var(--text-color)',
            fontSize: '16px',
          }}
        />

        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {filteredActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.action();
                onClose();
              }}
              style={{
                padding: '16px',
                backgroundColor: 'var(--background-color)',
                border: `2px solid ${action.color}`,
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = action.color + '20';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--background-color)';
                e.currentTarget.style.color = 'var(--text-color)';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{action.icon}</div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{action.name}</div>
              {action.shortcut && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <kbd style={{ 
                    padding: '2px 4px', 
                    backgroundColor: '#ddd', 
                    borderRadius: '2px',
                    fontFamily: 'monospace',
                  }}>
                    {action.shortcut}
                  </kbd>
                </div>
              )}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Appuyez sur <kbd style={{ padding: '2px 4px', backgroundColor: '#ddd', borderRadius: '2px', fontFamily: 'monospace' }}>Escape</kbd> pour fermer
        </div>
      </div>
    </div>
  );
};