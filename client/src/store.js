import { create } from 'zustand';

export const useStore = create((set) => ({
  collab: null,
  setCollab: (collab) => set({ collab }),

  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  theme: 'dark',
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  setSelectedId: (id) => set({ selectedId: id }),
  
  cursors: {},
  setCursors: (cursors) => set({ cursors }),
  updateCursor: (id, position) => set((state) => ({
    cursors: { ...state.cursors, [id]: position }
  })),
  removeCursor: (id) => set((state) => {
    const newCursors = { ...state.cursors };
    delete newCursors[id];
    return { cursors: newCursors };
  }),

  elements: [],
  setElements: (elements) => set({ elements }),
  addElement: (element) => set((state) => ({ 
    elements: [...state.elements, element] 
  })),
  
  zoom: 1,
  setZoom: (zoom) => set({ zoom }),
  
  canvasPosition: { x: 0, y: 0 },
  setCanvasPosition: (pos) => set({ canvasPosition: pos }),
}));
