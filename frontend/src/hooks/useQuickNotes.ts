interface QuickNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  color: string;
}

const STORAGE_KEY = 'aba_quick_notes';

export const useQuickNotes = () => {
  const getNotes = (): QuickNote[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  };

  const deleteNote = (id: string) => {
    const notes = getNotes().filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  };

  const clearAllNotes = () => {
    localStorage.removeItem(STORAGE_KEY);
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