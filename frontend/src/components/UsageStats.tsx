import { useUsageStats } from '../hooks/useUsageStats';

export const UsageStats = () => {
  const { getStats } = useUsageStats();
  const stats = getStats();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      fontSize: '14px',
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>📊 Statistiques d'Utilisation</h3>
      <div style={{ display: 'grid', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>📱 Ouvertures de l'app:</span>
          <strong>{stats.appOpens}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>📋 Commandes traitées:</span>
          <strong>{stats.totalOrders}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>👤 Clients créés:</span>
          <strong>{stats.totalCustomers}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>📴 Temps hors connexion:</span>
          <strong>{formatTime(stats.offlineTime)}</strong>
        </div>
        {stats.lastLogin && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>🕐 Dernière connexion:</span>
            <strong>{new Date(stats.lastLogin).toLocaleDateString('fr-FR')}</strong>
          </div>
        )}
      </div>
    </div>
  );
};