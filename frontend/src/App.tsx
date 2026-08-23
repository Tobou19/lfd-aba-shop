import { useState, useEffect } from 'react';
import Login from './pages/Login';
import { OfflineBanner } from './components/OfflineBanner';
import { useOfflineSync } from './hooks/useOfflineSync';
import { offlineStorage } from './utils/offlineStorage';

// Squelette minimal : après connexion, router vers le tableau de bord
// correspondant au rôle renvoyé par l'API (Caissier / Gestionnaire / Direction),
// en reprenant les écrans validés dans le prototype interactif.
export default function App() {
  const [role, setRole] = useState<string | null>(null);
  const { isOnline, syncStatus, pendingItems } = useOfflineSync();

  useEffect(() => {
    // Restaurer la session utilisateur si disponible
    const session = offlineStorage.getUserSession();
    if (session) {
      setRole(session.role);
    }
  }, []);

  const handleLogin = (userRole: string, sessionData: any) => {
    setRole(userRole);
    offlineStorage.saveUserSession({
      ...sessionData,
      role: userRole,
    });
  };

  const handleLogout = () => {
    setRole(null);
    offlineStorage.clearUserSession();
  };

  return (
    <>
      <OfflineBanner />
      {!role ? (
        <Login onLoggedIn={handleLogin} />
      ) : (
        <div style={{ padding: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}>
            <div>
              <h2>ABA SHOP - {role}</h2>
              <p style={{ fontSize: '14px', color: '#666' }}>
                {isOnline ? '🟢 En ligne' : '🟠 Hors ligne'}
              </p>
            </div>
            <div>
              {pendingItems.orders.length > 0 || pendingItems.customers.length > 0 ? (
                <div style={{ 
                  backgroundColor: '#FF9800', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  marginBottom: '8px',
                  fontSize: '14px',
                }}>
                  {pendingItems.orders.length + pendingItems.customers.length} éléments à synchroniser
                </div>
              ) : null}
              {syncStatus && (
                <div style={{ 
                  backgroundColor: '#2196F3', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  marginBottom: '8px',
                  fontSize: '14px',
                }}>
                  {syncStatus}
                </div>
              )}
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Déconnexion
              </button>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <h3>Tableau de bord {role}</h3>
            <p>Les écrans du prototype seront intégrés ici selon le rôle.</p>
            
            {!isOnline && (
              <div style={{ 
                backgroundColor: '#FFF3E0', 
                padding: '15px', 
                borderRadius: '4px',
                marginTop: '15px',
                border: '1px solid #FF9800',
              }}>
                <p style={{ margin: 0, color: '#E65100' }}>
                  <strong>Mode hors connexion actif</strong><br/>
                  Vous pouvez continuer à travailler. Les données seront synchronisées automatiquement lorsque la connexion sera rétablie.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
