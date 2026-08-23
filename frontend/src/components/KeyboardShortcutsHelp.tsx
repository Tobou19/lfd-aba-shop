import { useState } from 'react';
import { keyboardHelp } from '../hooks/useKeyboardShortcuts';

export const KeyboardShortcutsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
        title="Raccourcis clavier"
      >
        ⌨️ Raccourcis
      </button>

      {isOpen && (
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
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Raccourcis Clavier</h2>
              <button
                onClick={() => setIsOpen(false)}
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

            <div style={{ display: 'grid', gap: '8px' }}>
              {keyboardHelp.map((shortcut, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                  }}
                >
                  <kbd
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ddd',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                    }}
                  >
                    {shortcut.key}
                  </kbd>
                  <span>{shortcut.description}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
              Appuyez sur <kbd style={{ padding: '2px 4px', backgroundColor: '#ddd', borderRadius: '2px' }}>Escape</kbd> pour fermer
            </div>
          </div>
        </div>
      )}
    </>
  );
};