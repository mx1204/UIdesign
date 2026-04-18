const Y = require('yjs');
const { v4: uuidv4 } = require('uuid');

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
    socket.on('yjs-update', ({ projectId, update }) => {
      // update is a Uint8Array, but sent over socket as a Buffer/ArrayBuffer
      const doc = getDoc(projectId);
      Y.applyUpdate(doc, new Uint8Array(update));
      
      // Broadcast to others in the same project
      socket.to(projectId).emit('yjs-update', { update });
    });

    socket.on('get-initial-state', (projectId, callback) => {
      const doc = getDoc(projectId);
      const state = Y.encodeStateAsUpdate(doc);
      callback(state);
    });
  });
}

module.exports = { setupCollaboration };
