import { Layers, Cuboid as FileTree, Eye, EyeOff, Lock, Unlock, Code } from 'lucide-react';

const Sidebar = ({ onOpenCode }) => {
  const { elements, selectedId, setSelectedId } = useStore();

  return (
    <div className="sidebar glass">
      <div className="sidebar-header">
        <Layers size={14} />
        <span>Layers</span>
      </div>
      
      <div className="layer-list">
        {elements.length === 0 ? (
          <div className="empty-state">No layers yet</div>
        ) : (
          elements.map((el) => (
            <div 
              key={el.id} 
              className={`layer-item ${selectedId === el.id ? 'active' : ''}`}
              onClick={() => setSelectedId(el.id)}
            >
              <div className="layer-info">
                <FileTree size={12} />
                <span>{el.name || el.type}</span>
              </div>
              <div className="layer-actions">
                <Eye size={12} className="action-icon" />
                <Unlock size={12} className="action-icon" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button className="btn-secondary full-width" onClick={onOpenCode}>
          <Code size={14} />
          <span>Generate BCE Code</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-color);
        }
        .full-width {
          width: 100%;
          justify-content: center;
        }
        .sidebar-header {
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
        .layer-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }
        .layer-item {
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .layer-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .layer-item.active {
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent-color);
        }
        .layer-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .layer-actions {
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .layer-item:hover .layer-actions {
          opacity: 0.6;
        }
        .action-icon:hover {
          opacity: 1;
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

export default Sidebar;
