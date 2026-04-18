import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Transformer, Text } from 'react-konva';
import { useStore } from '../store';

const Editor = () => {
  const { 
    elements, 
    setElements, 
    activeTool, 
    selectedId, 
    setSelectedId,
    zoom,
    setZoom,
    canvasPosition,
    setCanvasPosition,
    collab,
    cursors,
    theme
  } = useStore();

  const stageRef = useRef();
  const transformerRef = useRef();
  const [stageSize, setStageSize] = useState({ width: window.innerWidth - 480, height: window.innerHeight - 48 });
  const [editingText, setEditingText] = useState(null); // { id, x, y, width, value }

  // Recalculate stage size on resize
  useEffect(() => {
    const onResize = () => setStageSize({ width: window.innerWidth - 480, height: window.innerHeight - 48 });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Handle selection transformer
  useEffect(() => {
    if (transformerRef.current && selectedId) {
      const selectedNode = stageRef.current.findOne('#' + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
        transformerRef.current.nodes([]);
    }
  }, [selectedId, elements]);

  // Handle keyboard shortcuts (Delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
        // Prevent deletion if focus is on an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (collab) {
           collab.deleteElement(selectedId);
        } else {
           setElements(elements.filter(el => el.id !== selectedId));
        }
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, collab, setElements, setSelectedId]);

  const handleMouseDown = (e) => {
    // If clicked on empty space, deselect
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      
      // If a drawing tool is active, create element
      if (activeTool !== 'select' && activeTool !== 'ai') {
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        
        // Convert screen coordinates to stage coordinates (accounting for zoom/pan)
        const x = (pointer.x - stage.x()) / stage.scaleX();
        const y = (pointer.y - stage.y()) / stage.scaleX();

        const isWireframe = theme === 'wireframe';
        const newElement = {
          id: 'element-' + Date.now(),
          type: activeTool,
          x,
          y,
          width: activeTool === 'text' ? 120 : 100,
          height: activeTool === 'text' ? 30 : 100,
          fill: activeTool === 'text' ? (isWireframe ? '#222222' : '#ffffff') : (isWireframe ? 'transparent' : '#aed0fb'),
          stroke: isWireframe ? '#666666' : '#3b82f6',
          strokeWidth: 2,
          text: activeTool === 'text' ? 'Double click to edit' : '',
          fontSize: 14,
          name: activeTool.charAt(0).toUpperCase() + activeTool.slice(1)
        };

        if (collab) {
            collab.setElements([...elements, newElement]);
        } else {
            setElements([...elements, newElement]);
        }
        setSelectedId(newElement.id);
      }
      return;
    }

    // Handle selection
    const clickedId = e.target.id();
    if (clickedId) {
      setSelectedId(clickedId);
    }
  };

  const handleTransformEnd = (e) => {
    const node = e.target;
    const id = node.id();
    const updates = {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * node.scaleX()),
      height: Math.max(5, node.height() * node.scaleY()),
      rotation: node.rotation()
    };
    
    if (collab) {
        collab.updateElement(id, updates);
    } else {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    }

    // Reset scale so width/height take over
    node.scaleX(1);
    node.scaleY(1);
  };

  const handleDragEnd = (e) => {
    const node = e.target;
    const id = node.id();
    const updates = { x: node.x(), y: node.y() };

    if (collab) {
      collab.updateElement(id, updates);
    } else {
      setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();

    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    };
    stage.position(newPos);
    setZoom(newScale);
    setCanvasPosition(newPos);
  };

  const handleMouseMove = (e) => {
      if (collab) {
          const stage = e.target.getStage();
          const pointer = stage.getPointerPosition();
          if (pointer) {
              const x = (pointer.x - stage.x()) / stage.scaleX();
              const y = (pointer.y - stage.y()) / stage.scaleX();
              collab.sendCursor({ x, y });
          }
      }
  };

  const commitTextEdit = () => {
    if (!editingText) return;
    const { id, value } = editingText;
    if (collab) collab.updateElement(id, { text: value });
    else setElements(elements.map(item => item.id === id ? { ...item, text: value } : item));
    setEditingText(null);
  };

  return (
    <div className="editor-container">
      {/* Inline text editor overlay */}
      {editingText && (
        <textarea
          autoFocus
          className="inline-text-editor"
          style={{ left: editingText.x, top: editingText.y, minWidth: editingText.width }}
          value={editingText.value}
          onChange={(e) => setEditingText(prev => ({ ...prev, value: e.target.value }))}
          onBlur={commitTextEdit}
          onKeyDown={(e) => { if (e.key === 'Escape') setEditingText(null); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitTextEdit(); } }}
        />
      )}
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        draggable={activeTool === 'select' && !selectedId}
      >
        <Layer>
          {elements.map((el) => {
            const commonProps = {
                key: el.id,
                id: el.id,
                ...el,
                draggable: activeTool === 'select',
                onDragEnd: handleDragEnd,
                onTransformEnd: handleTransformEnd,
            };

            if (el.type === 'rect') {
              return <Rect {...commonProps} />;
            }
            if (el.type === 'circle') {
                return (
                  <Circle
                    {...commonProps}
                    radius={el.width / 2}
                  />
                );
            }
            if (el.type === 'text') {
                return (
                  <Text
                    {...commonProps}
                    text={el.text}
                    fontSize={el.fontSize || 14}
                    onDblClick={(e) => {
                        const node = e.target;
                        const stage = stageRef.current;
                        const stageBox = stage.container().getBoundingClientRect();
                        const absPos = node.getAbsolutePosition();
                        setEditingText({
                            id: el.id,
                            value: el.text || '',
                            x: stageBox.left + absPos.x,
                            y: stageBox.top + absPos.y,
                            width: Math.max(el.width || 120, 120),
                        });
                        setSelectedId(null); // hide transformer during edit
                    }}
                  />
                );
            }
            return null;
          })}
          {selectedId && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
        
        {/* Cursors Layer */}
        <Layer>
            {Object.entries(cursors).map(([id, pos]) => (
                <React.Fragment key={id}>
                    <Circle x={pos.x} y={pos.y} radius={4} fill={id === collab?.socket.id ? 'transparent' : '#f43f5e'} />
                    <Text 
                        x={pos.x + 10} 
                        y={pos.y + 10} 
                        text={id === collab?.socket.id ? '' : 'User ' + id.substr(0, 4)} 
                        fill="white" 
                        fontSize={10} 
                    />
                </React.Fragment>
            ))}
        </Layer>
      </Stage>

      <div className="zoom-indicator glass">
        {Math.round(zoom * 100)}%
      </div>

      <style>{`
        .editor-container {
          flex: 1;
          background-color: var(--canvas-bg);
          position: relative;
          overflow: hidden;
          cursor: ${activeTool === 'select' ? 'default' : 'crosshair'};
        }
        .zoom-indicator {
          position: absolute;
          bottom: 20px;
          right: 20px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          color: var(--text-dim);
          pointer-events: none;
        }
        .inline-text-editor {
          position: fixed;
          z-index: 9999;
          border: 2px solid var(--accent-color);
          border-radius: 4px;
          background: rgba(13, 13, 13, 0.95);
          color: var(--text-main);
          padding: 4px 6px;
          font-size: 14px;
          font-family: inherit;
          resize: both;
          min-height: 30px;
          outline: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};

export default Editor;
