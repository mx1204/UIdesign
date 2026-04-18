const Y = require('yjs');


// Simple Yjs doc store
const docs = new Map();

function getDoc(projectId) {
  if (!docs.has(projectId)) {
    const doc = new Y.Doc();
    docs.set(projectId, doc);
  }
  return docs.get(projectId);
}

// In a real app, you'd use something like y-socket.io
// For this MVP, we'll handle the update propagation manually via Socket.io

function setupCollaboration(io) {
  io.on('connection', (socket) => {
    let currentProject = null;

    socket.on('join-project', (projectId) => {
      // Leave any previous room
      if (currentProject) {
        socket.leave(currentProject);
      }
      currentProject = projectId;
      socket.join(projectId);
      console.log(`[Collab] Socket ${socket.id} joined project: ${projectId}`);
    });

    socket.on('yjs-update', ({ projectId, update }) => {
      const doc = getDoc(projectId);
      Y.applyUpdate(doc, new Uint8Array(update));
      // Broadcast to others in the same project room
      socket.to(projectId).emit('yjs-update', { update });
    });

    socket.on('get-initial-state', (projectId, callback) => {
      const doc = getDoc(projectId);
      const state = Y.encodeStateAsUpdate(doc);
      callback(Array.from(state));
    });

    socket.on('cursor-move', ({ projectId, position }) => {
      socket.to(projectId).emit('cursor-update', { id: socket.id, position });
    });

    socket.on('disconnect', () => {
      if (currentProject) {
        socket.to(currentProject).emit('user-left', socket.id);
      }
      console.log(`[Collab] Socket ${socket.id} disconnected`);
    });
  });
}

module.exports = { setupCollaboration };
