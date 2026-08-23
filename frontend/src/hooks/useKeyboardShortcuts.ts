import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        // Skip if key is undefined or not a string
        if (!shortcut.key || typeof shortcut.key !== 'string') continue;
        
        const keyMatch = event.key?.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export const keyboardHelp = [
  { key: 'Ctrl + K', description: 'Recherche globale' },
  { key: 'Ctrl + L', description: 'Mode clair/sombre' },
  { key: 'Ctrl + S', description: 'Synchroniser' },
  { key: 'Ctrl + H', description: 'Page d\'accueil' },
  { key: 'Escape', description: 'Fermer/Fermer modal' },
  { key: 'F1', description: 'Aide' },
];