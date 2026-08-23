import { useState, useEffect } from 'react';
import Login from './pages/Login';
import { OfflineBanner } from './components/OfflineBanner';
import { useOfflineSync } from './hooks/useOfflineSync';
import { offlineStorage } from './utils/offlineStorage';
import { ThemeToggle } from './components/ThemeToggle';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';
import { GlobalSearch } from './components/GlobalSearch';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { UsageStats } from './components/UsageStats';
import { useUsageStats as useUsageStatsHook } from './hooks/useUsageStats';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useUserPreferences } from './hooks/useUserPreferences';
import { useTheme } from './hooks/useTheme';
import { QuickMode } from './components/QuickMode';
import { useFavorites } from './hooks/useFavorites';
import { useRecentActions } from './hooks/useRecentActions';
import { useLocalNotifications } from './hooks/useLocalNotifications';
import './styles/theme.css';
import './styles/responsive.css';
import './styles/responsive.css';

// Squelette minimal : après connexion, router vers le tableau de bord
// correspondant au rôle renvoyé par l'API (Caissier / Gestionnaire / Direction),
// en reprenant les écrans validés dans le prototype interactif.
export default function App() {
  const [role, setRole] = useState<string | null>(null);
  const { isOnline, syncStatus, pendingItems } = useOfflineSync();
  const { theme, effectiveTheme, changeTheme } = useTheme();
  const { initTracking } = useUsageStatsHook();
  const { getPreferences } = useUserPreferences();
  const { getFavorites } = useFavorites();
  const { unreadCount } = useLocalNotifications();
  const [isQuickModeOpen, setIsQuickModeOpen] = useState(false);

  // Configuration des raccourcis clavier
  useKeyboardShortcuts([
    {
      key: 'l',
      ctrl: true,
      action: () => {
        const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        changeTheme(themes[nextIndex]);
      },
      description: 'Changer de thème',
    },
    {
      key: 'q',
      ctrl: true,
      action: () => setIsQuickModeOpen(true),
      description: 'Mode rapide',
    },
  ]);

  useEffect(() => {
    // Restaurer la session utilisateur si disponible
    const session = offlineStorage.getUserSession();
    if (session) {
      setRole(session.role);
    }
    
    // Initialiser le tracking d'utilisation
    initTracking();
  }, [initTracking]);

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

  const preferences = getPreferences();

  return (
    <>
      <OnboardingTutorial />
      <GlobalSearch />
      <QuickMode isOpen={isQuickModeOpen} onClose={() => setIsQuickModeOpen(false)} />
      <OfflineBanner />
      {!role ? (
        <Login onLoggedIn={handleLogin} />
      ) : (
        <div style={{ 
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'var(--background-color)',
          color: 'var(--text-color)',
          minHeight: '100vh',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: 'var(--surface-color)',
            borderRadius: '8px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>ABA SHOP - {role}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                {isOnline ? '🟢 En ligne' : '🟠 Hors ligne'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsQuickModeOpen(true)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Mode rapide (Ctrl+Q)"
              >
                <span>⚡</span>
                <span>Rapide</span>
              </button>
              <ThemeToggle />
              <KeyboardShortcutsHelp />
              {unreadCount > 0 && (
                <div style={{ 
                  backgroundColor: '#f44336', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>🔔</span>
                  <span>{unreadCount}</span>
                </div>
              )}
              {getFavorites().length > 0 && (
                <div style={{ 
                  backgroundColor: '#FFD700', 
                  color: '#333', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>⭐</span>
                  <span>{getFavorites().length}</span>
                </div>
              )}
              {pendingItems.orders.length > 0 || pendingItems.customers.length > 0 ? (
                <div style={{ 
                  backgroundColor: '#FF9800', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>📋</span>
                  <span>{pendingItems.orders.length + pendingItems.customers.length} à synchroniser</span>
                </div>
              ) : null}
              {syncStatus && (
                <div style={{ 
                  backgroundColor: '#2196F3', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>🔄</span>
                  <span>{syncStatus}</span>
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
            backgroundColor: 'var(--surface-color)', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--border-color)',
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-color)' }}>Tableau de bord {role}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Les écrans du prototype seront intégrés ici selon le rôle.</p>
            
            {!isOnline && (
              <div style={{ 
                backgroundColor: '#FFF3E0', 
                padding: '15px', 
                borderRadius: '4px',
                marginTop: '15px',
                border: '1px solid #FF9800',
                color: '#E65100',
              }}>
                <p style={{ margin: 0 }}>
                  <strong>⚠️ Mode hors connexion actif</strong><br/>
                  Vous pouvez continuer à travailler. Les données seront synchronisées automatiquement lorsque la connexion sera rétablie.
                </p>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              <div style={{ 
                padding: '16px', 
                backgroundColor: 'var(--background-color)', 
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>💡 Astuces rapides</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                  <li>Ctrl+K pour la recherche globale</li>
                  <li>Mode hors connexion automatique</li>
                  <li>Synchronisation transparente</li>
                </ul>
              </div>

              <div style={{ 
                padding: '16px', 
                backgroundColor: 'var(--background-color)', 
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>⚙️ Préférences</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={preferences.notificationsEnabled} readOnly />
                    <span>Notifications activées</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={preferences.autoSyncEnabled} readOnly />
                    <span>Synchronisation automatique</span>
                  </label>
                </div>
              </div>

              <UsageStats />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
