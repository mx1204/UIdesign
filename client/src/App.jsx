import React, { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';
import Editor from './components/Editor';
import AIPrompt from './components/AIPrompt';
import CodePanel from './components/CodePanel';
import { useStore } from './store';
import { CollaborationProvider } from './collab';
import './App.css';

function App() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);
  const { setActiveTool, setElements, setCollab, updateCursor, removeCursor } = useStore();

  // Initialize collaboration — runs once on mount.
  // Zustand setters are stable references so empty dep array is correct.
  useEffect(() => {
    const provider = new CollaborationProvider(
      'project-1',
      (newElements) => setElements(Object.values(newElements)),
      (id, pos) => updateCursor(id, pos),
      (id) => removeCursor(id)
    );
    setCollab(provider);
    return () => provider.socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync store changes BACK to collab (debounced or on action)
  // For simplicity, we'll let individual components call collab methods if provided

  const handleToolSelect = (tool) => {
    if (tool === 'ai') {
      setIsAIModalOpen(true);
    } else {
      setActiveTool(tool);
    }
  };

  return (
    <div className="app-container">
      <Toolbar onToolSelect={handleToolSelect} />
      <div className="main-layout">
        <Sidebar onOpenCode={() => setIsCodePanelOpen(true)} />
        <Editor />
        <PropertiesPanel />
      </div>

      <AIPrompt isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      <CodePanel isOpen={isCodePanelOpen} onClose={() => setIsCodePanelOpen(false)} />
    </div>
  );
}

export default App;
