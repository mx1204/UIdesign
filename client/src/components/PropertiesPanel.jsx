import React from 'react';
import { useStore } from '../store';
import { Settings, Maximize, Palette, Type as TypeIcon } from 'lucide-react';

const PropertiesPanel = () => {
  const { elements, selectedId, setElements } = useStore();
  const selectedElement = elements.find(el => el.id === selectedId);

  const updateProperty = (prop, value) => {
    setElements(elements.map(el => 
      el.id === selectedId ? { ...el, [prop]: value } : el
    ));
  };

  if (!selectedElement) {
    return (
      <div className="properties-panel glass">
        <div className="panel-header">
          <Settings size={14} />
          <span>Properties</span>
        </div>
        <div className="empty-state">Select an element to edit properties</div>
      </div>
    );
  }

  return (
    <div className="properties-panel glass">
      <div className="panel-header">
        <Settings size={14} />
        <span>Properties</span>
      </div>

      <div className="section">
        <div className="section-title"><Maximize size={12}/> Layout</div>
        <div className="grid-2">
          <div className="input-group">
            <label>X</label>
            <input 
              type="number" 
              value={Math.round(selectedElement.x)} 
              onChange={(e) => updateProperty('x', parseFloat(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label>Y</label>
            <input 
              type="number" 
              value={Math.round(selectedElement.y)} 
              onChange={(e) => updateProperty('y', parseFloat(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label>W</label>
            <input 
              type="number" 
              value={Math.round(selectedElement.width)} 
              onChange={(e) => updateProperty('width', parseFloat(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label>H</label>
            <input 
              type="number" 
              value={Math.round(selectedElement.height)} 
              onChange={(e) => updateProperty('height', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title"><Palette size={12}/> Appearance</div>
        <div className="input-group full">
          <label>Fill</label>
          <div className="color-input">
            <input 
              type="color" 
              value={selectedElement.fill || '#ffffff'} 
              onChange={(e) => updateProperty('fill', e.target.value)}
            />
            <span>{selectedElement.fill || '#ffffff'}</span>
          </div>
        </div>
        <div className="input-group full">
          <label>Stroke</label>
          <div className="color-input">
            <input 
              type="color" 
              value={selectedElement.stroke || '#000000'} 
              onChange={(e) => updateProperty('stroke', e.target.value)}
            />
            <span>{selectedElement.stroke || '#000000'}</span>
          </div>
        </div>
      </div>
      
      {selectedElement.type === 'text' && (
        <div className="section">
          <div className="section-title"><TypeIcon size={12}/> Text</div>
          <div className="input-group full">
            <label>Content</label>
            <textarea 
              value={selectedElement.text || ''} 
              onChange={(e) => updateProperty('text', e.target.value)}
              rows={3}
            />
          </div>
          <div className="input-group full">
            <label>Font Size</label>
            <input 
              type="number" 
              value={selectedElement.fontSize || 14} 
              onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .properties-panel {
          width: var(--sidebar-width);
          border-left: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }
        .panel-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .section {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-dim);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .input-group label {
          font-size: 10px;
          color: var(--text-dim);
        }
        .input-group input, .input-group textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: white;
          padding: 6px 8px;
          font-size: 12px;
          outline: none;
          font-family: inherit;
          resize: none;
        }
        .input-group input:focus, .input-group textarea:focus {
          border-color: var(--accent-color);
          background: rgba(255, 255, 255, 0.08);
        }
        .color-input {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }
        .color-input input {
          width: 24px;
          height: 24px;
          padding: 0;
          border: none;
          background: none;
          cursor: pointer;
        }
        .color-input span {
          font-size: 12px;
          text-transform: uppercase;
        }
        .empty-state {
          padding: 32px;
          text-align: center;
          font-size: 12px;
          color: var(--text-dim);
        }
      `}</style>
    </div>
  );
};

export default PropertiesPanel;
