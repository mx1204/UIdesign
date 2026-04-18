import * as Y from 'yjs';
import io from 'socket.io-client';

export class CollaborationProvider {
  constructor(projectId, onUpdate, onCursorUpdate, onCursorRemove) {
    this.projectId = projectId;
    this.doc = new Y.Doc();
    this.elementsMap = this.doc.getMap('elements');
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL || (window.location.origin.includes('localhost') ? 'http://localhost:3001' : window.location.origin);
    this.socket = io(backendUrl);

    this.socket.on('connect', () => {
      console.log('Connected to collaboration server');
      this.socket.emit('join-project', projectId);
      
      this.socket.emit('get-initial-state', projectId, (state) => {
        Y.applyUpdate(this.doc, new Uint8Array(state));
      });
    });

    this.socket.on('yjs-update', ({ update }) => {
      Y.applyUpdate(this.doc, new Uint8Array(update));
    });

    this.socket.on('cursor-update', ({ id, position }) => {
        onCursorUpdate(id, position);
    });

    this.socket.on('user-left', (id) => {
        onCursorRemove(id);
    });

    this.doc.on('update', (update, origin) => {
      if (origin !== this.socket) {
        this.socket.emit('yjs-update', { projectId, update: Array.from(update) });
        onUpdate(this.elementsMap.toJSON());
      }
    });

    this.elementsMap.observe(() => {
        onUpdate(this.elementsMap.toJSON());
    });
  }

  setElements(elements) {
    this.doc.transact(() => {
      // Clear and reset? Or incremental update?
      // For simplicity in MVP, we'll do incremental mapping
      elements.forEach(el => {
        this.elementsMap.set(el.id, el);
      });
    }, this.socket);
  }

  updateElement(id, props) {
      const el = this.elementsMap.get(id);
      if (el) {
          this.elementsMap.set(id, { ...el, ...props });
      }
  }

  deleteElement(id) {
      this.elementsMap.delete(id);
  }

  sendCursor(position) {
      this.socket.emit('cursor-move', { projectId: this.projectId, position });
  }
}
