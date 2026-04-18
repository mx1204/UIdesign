import React, { useState } from 'react';
import { useStore } from '../store';
import { Code, Upload, Loader2, FileImage, X, Check } from 'lucide-react';

const CodePanel = ({ isOpen, onClose }) => {
  const { elements } = useStore();
  const [classDiagram, setClassDiagram] = useState(null);
  const [sequenceDiagram, setSequenceDiagram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'class') setClassDiagram(reader.result);
        if (type === 'sequence') setSequenceDiagram(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCode = async () => {
    if (!classDiagram || !sequenceDiagram) return;
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classDiagram,
          sequenceDiagram,
          canvasState: elements
        }),
      });
      const data = await response.json();
      setGeneratedCode(data.code);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="code-panel glass">
      <div className="panel-header">
        <div className="title">
          <Code size={16} className="code-icon" />
          <span>BCE Code Generation</span>
        </div>
        <button onClick={onClose} className="icon-btn">
          <X size={18} />
        </button>
      </div>

      <div className="panel-body">
        <div className="upload-section">
          <div className="upload-box">
             <label className="upload-label">
                <div className="upload-content">
                  {classDiagram ? <Check size={20} color="#22c55e" /> : <Upload size={20} />}
                  <span>Class Diagram</span>
                </div>
                <input type="file" onChange={(e) => handleFileUpload(e, 'class')} hidden accept="image/*" />
             </label>
             <label className="upload-label">
                <div className="upload-content">
                  {sequenceDiagram ? <Check size={20} color="#22c55e" /> : <Upload size={20} />}
                  <span>Sequence Diagram</span>
                </div>
                <input type="file" onChange={(e) => handleFileUpload(e, 'sequence')} hidden accept="image/*" />
             </label>
          </div>
          
          <button 
            className="btn-primary generate-btn" 
            onClick={generateCode}
            disabled={loading || !classDiagram || !sequenceDiagram}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Generate BCE Code'}
          </button>
        </div>

        {generatedCode && (
          <div className="code-result">
            <div className="code-header">
               <span>Generated Code (React/Node)</span>
               <button className="copy-btn" onClick={() => navigator.clipboard.writeText(generatedCode)}>Copy</button>
            </div>
            <pre className="code-block">
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}
      </div>

      <style jsx>{`
        .code-panel {
          position: fixed;
          top: 60px;
          right: 20px;
          bottom: 20px;
          width: 500px;
          border-radius: var(--panel-radius);
          z-index: 500;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .panel-header {
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
        .code-icon {
          color: var(--accent-color);
        }
        .panel-body {
          padding: 20px;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .upload-section {
          background: rgba(255, 255, 255, 0.03);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
        .upload-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .upload-label {
          cursor: pointer;
        }
        .upload-content {
          border: 1px dashed var(--border-color);
          padding: 16px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          transition: background 0.2s;
        }
        .upload-content:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .generate-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); } to { transform: rotate(360deg); }
        }
        .code-result {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-dim);
        }
        .copy-btn {
          font-size: 11px;
          color: var(--accent-color);
          text-decoration: underline;
        }
        .code-block {
          background: #0d0d0d;
          padding: 16px;
          border-radius: 8px;
          font-size: 12px;
          color: #d1d5db;
          white-space: pre-wrap;
          font-family: 'Fira Code', monospace;
          border: 1px solid var(--border-color);
          max-height: 500px;
          overflow: auto;
        }
      `}</style>
    </div>
  );
};

export default CodePanel;
