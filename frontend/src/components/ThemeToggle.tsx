import { useTheme } from '../hooks/useTheme';

export const ThemeToggle = () => {
  const { theme, effectiveTheme, changeTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    changeTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    if (theme === 'auto') {
      return effectiveTheme === 'light' ? '🌤️' : '🌙';
    }
    return theme === 'light' ? '☀️' : '🌙';
  };

  const getThemeName = () => {
    if (theme === 'auto') return 'Auto';
    if (theme === 'light') return 'Clair';
    return 'Sombre';
  };

  return (
    <button
      onClick={cycleTheme}
      style={{
        padding: '8px 12px',
        backgroundColor: 'transparent',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
      title={`Thème actuel: ${getThemeName()}`}
    >
      <span>{getIcon()}</span>
      <span style={{ fontSize: '12px' }}>
        {getThemeName()}
      </span>
    </button>
  );
};