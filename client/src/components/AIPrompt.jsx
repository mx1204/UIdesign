import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { useStore } from '../store';

const AIPrompt = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { setElements, elements, collab } = useStore();

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      
      if (data.elements) {
        // Offset elements to current view or center
        const newElements = data.elements.map(el => ({
            ...el,
            id: 'ai-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        }));
        
        if (collab) {
            collab.setElements([...elements, ...newElements]);
        } else {
            setElements([...elements, ...newElements]);
        }
        onClose();
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal glass">
        <div className="modal-header">
          <div className="title">
            <Sparkles size={16} className="sparkle-icon" />
            <span>AI UI Designer</span>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body">
          <p className="description">Describe what you want to build, and I'll generate the wireframe for you.</p>
          <textarea 
            placeholder="e.g., A login card with email, password fields and a blue submit button"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button 
            className="btn-primary generate-btn" 
            onClick={handleGenerate}
            disabled={loading || !prompt}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Generate Design'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .ai-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .ai-modal {
          width: 480px;
          border-radius: var(--panel-radius);
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .modal-header {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
        }
        .title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }
        .sparkle-icon {
          color: #a855f7;
        }
        .modal-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .description {
          font-size: 13px;
          color: var(--text-dim);
        }
        textarea {
          width: 100%;
          height: 120px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: white;
          padding: 12px;
          font-family: inherit;
          font-size: 14px;
          resize: none;
          outline: none;
        }
        textarea:focus {
          border-color: #a855f7;
        }
        .generate-btn {
          width: 100%;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 40px;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AIPrompt;
