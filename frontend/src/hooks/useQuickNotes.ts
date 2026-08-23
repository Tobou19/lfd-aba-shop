interface QuickNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  color: string;
}

const STORAGE_KEY = 'aba_quick_notes';

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('localStorage error:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('localStorage error:', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('localStorage error:', e);
    }
  },
};

export const useQuickNotes = () => {
  const getNotes = (): QuickNote[] => {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing notes:', e);
      return [];
    }
  };

  const addNote = (content: string, color: string = '#FFFF00') => {
    const notes = getNotes();
    const newNote: QuickNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color,
    };
    notes.unshift(newNote);
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  };

  const updateNote = (id: string, content: string, color?: string) => {
    const notes = getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index] = {
        ...notes[index],
        content,
        updatedAt: new Date().toISOString(),
        ...(color && { color }),
      };
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  };

  const deleteNote = (id: string) => {
    const notes = getNotes().filter(n => n.id !== id);
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  };

  const clearAllNotes = () => {
    safeLocalStorage.removeItem(STORAGE_KEY);
  };

  const searchNotes = (query: string): QuickNote[] => {
    const notes = getNotes();
    const lowerQuery = query.toLowerCase();
    return notes.filter(n => n.content.toLowerCase().includes(lowerQuery));
  };

  return {
    getNotes,
    addNote,
    updateNote,
    deleteNote,
    clearAllNotes,
    searchNotes,
  };
};