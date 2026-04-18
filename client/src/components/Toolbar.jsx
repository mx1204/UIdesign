import React from 'react';
import { useStore } from '../store';
import { 
  Pointer, 
  Square, 
  Circle as CircleIcon, 
  Type, 
  MousePointer2,
  Sparkles,
  Share2,
  Download,
  Sun,
  Moon,
  LayoutTemplate,
  ChevronDown
} from 'lucide-react';
import { WIREFRAME_TEMPLATES } from '../constants/templates';

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: CircleIcon, label: 'Circle' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'ai', icon: Sparkles, label: 'AI Generate', highlight: true },
];

const Toolbar = ({ onToolSelect }) => {
  const { activeTool, theme, setTheme, elements, setElements, collab } = useStore();
  const [showTemplates, setShowTemplates] = React.useState(false);

  const addTemplate = (template) => {
    const newElements = template.elements.map(el => ({
      ...el,
      id: 'template-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    }));
    
    if (collab) {
      collab.setElements([...elements, ...newElements]);
    } else {
      setElements([...elements, ...newElements]);
    }
    setShowTemplates(false);
  };

  return (
    <div className="toolbar glass">
      <div className="tool-section">
        <div className="logo">
           <div className="logo-icon">AG</div>
           <span>Antigravity</span>
        </div>
        <div className="divider" />
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`icon-btn ${activeTool === tool.id ? 'active' : ''} ${tool.highlight ? 'ai-btn' : ''}`}
            onClick={() => onToolSelect(tool.id)}
            title={tool.label}
          >
            <tool.icon size={18} />
          </button>
        ))}
      </div>

      <div className="tool-section right">
        <div className="template-dropdown-container">
          <button 
            className="btn-secondary" 
            onClick={() => setShowTemplates(!showTemplates)}
            title="Templates"
          >
            <LayoutTemplate size={16} />
            <span>Templates</span>
            <ChevronDown size={14} />
          </button>
          
          {showTemplates && (
            <div className="template-menu glass">
              {WIREFRAME_TEMPLATES.map((t) => (
                <div 
                  key={t.name} 
                  className="template-item" 
                  onClick={() => addTemplate(t)}
                >
                  {t.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="divider" />

        <button 
          className="icon-btn" 
          onClick={() => setTheme(theme === 'dark' ? 'wireframe' : 'dark')}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button className="icon-btn" title="Export">
          <Download size={18} />
        </button>
        <button className="btn-primary">Share</button>
      </div>

      <style jsx>{`
        .toolbar {
          height: var(--header-height);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid var(--border-color);
          z-index: 100;
          transition: background-color var(--transition-fast);
        }
        .tool-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 14px;
          margin-right: 12px;
        }
        .logo-icon {
          background: var(--accent-color);
          color: white;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          font-size: 10px;
        }
        .divider {
          width: 1px;
          height: 24px;
          background: var(--border-color);
          margin: 0 8px;
        }
        .ai-btn.active {
          background: rgba(168, 85, 247, 0.2);
          color: #a855f7;
        }
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--border-color);
          transition: background var(--transition-fast);
        }
        .btn-secondary:hover {
          background: rgba(128, 128, 128, 0.05);
        }
        .template-dropdown-container {
          position: relative;
        }
        .template-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 180px;
          border-radius: 8px;
          padding: 4px;
          z-index: 200;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .template-item {
          padding: 8px 12px;
          font-size: 13px;
          border-radius: 4px;
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .template-item:hover {
          background: var(--accent-color);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Toolbar;
