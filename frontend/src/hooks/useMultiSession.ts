interface UserSession {
  id: string;
  email: string;
  role: string;
  name: string;
  loginTime: string;
  lastActivity: string;
  deviceId: string;
}

const STORAGE_KEY = 'aba_sessions';
const MAX_SESSIONS = 5;

export const useMultiSession = () => {
  const getSessions = (): UserSession[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const addSession = (session: Omit<UserSession, 'id' | 'loginTime' | 'lastActivity'>) => {
    const sessions = getSessions();
    const deviceId = session.deviceId || `device-${Math.random().toString(36).substring(2, 11)}`;
    
    const newSession: UserSession = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      deviceId,
    };

    // Remove existing session for same device
    const filtered = sessions.filter(s => s.deviceId !== deviceId);
    filtered.unshift(newSession);
    
    // Keep only MAX_SESSIONS most recent
    const trimmed = filtered.slice(0, MAX_SESSIONS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return newSession;
  };

  const updateLastActivity = (sessionId: string) => {
    const sessions = getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index].lastActivity = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  };

  const removeSession = (sessionId: string) => {
    const sessions = getSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  };

  const getCurrentSession = (deviceId: string): UserSession | undefined => {
    const sessions = getSessions();
    return sessions.find(s => s.deviceId === deviceId);
  };

  const clearAllSessions = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const getActiveSessions = (): UserSession[] => {
    const sessions = getSessions();
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    return sessions.filter(s => new Date(s.lastActivity) > thirtyMinutesAgo);
  };

  const getCurrentDeviceId = (): string => {
    let deviceId = localStorage.getItem('aba_device_id');
    if (!deviceId) {
      deviceId = `device-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('aba_device_id', deviceId);
    }
    return deviceId;
  };

  return {
    getSessions,
    addSession,
    updateLastActivity,
    removeSession,
    getCurrentSession,
    clearAllSessions,
    getActiveSessions,
    getCurrentDeviceId,
  };
};