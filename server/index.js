const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { setupCollaboration } = require('./yjs-server');
const Groq = require('groq-sdk');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from the React app
const staticPath = path.resolve(__dirname, '../client/dist');
console.log(`[Server] Serving static files from: ${staticPath}`);
app.use(express.static(staticPath));

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const checkGroq = (res) => {
  if (!groq) {
    res.status(503).json({ error: 'GROQ_API_KEY not configured on server' });
    return false;
  }
  return true;
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// AI UI Generation Endpoint
app.post('/api/generate-ui', async (req, res) => {
  if (!checkGroq(res)) return;
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a professional UX Wireframe Designer. Generate a JSON array of UI elements.
          Each element MUST follow this schema:
          {
            "id": string,
            "type": "rect" | "circle" | "text",
            "x": number,
            "y": number,
            "width": number,
            "height": number,
            "fill": string (hex),
            "stroke": string (hex),
            "text"?: string (if type is text),
            "fontSize"?: number,
            "name": string
          }
          Style Guidance: For wireframes, use minimalist styles: transparent or very light gray fills, gray or black strokes (2px).
          The root should be a JSON object: { "elements": [...] }.
          Generate a layout for: "${prompt}"`
        }
      ],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(response.choices[0].message.content);
    res.json(data);
  } catch (error) {
    console.error('Groq Error:', error);
    res.status(500).json({ error: 'Failed to generate UI' });
  }
});

// Diagram Analysis & Code Generation Endpoint
app.post('/api/analyze-diagrams', async (req, res) => {
  if (!checkGroq(res)) return;
  const { classDiagram, sequenceDiagram, canvasState } = req.body;
  if (!classDiagram || !sequenceDiagram) {
    return res.status(400).json({ error: 'classDiagram and sequenceDiagram are required' });
  }

  try {
    const messages = [
      {
        role: "system",
        content: `You are a Senior Software Architect. Analyze UML diagrams and design to generate JavaScript (React/Node) code.
        
        Follow the BCE (Boundary-Control-Entity) pattern:
        - Boundary: UI components (Canvas JSON).
        - Control: Logic/controllers (Sequence diagram).
        - Entity: Data models (Class diagram).

        Output React components, Node.js controllers, and Schemas. Use EXACT names from diagrams.`
      },
      {
        role: "user",
        content: [
          { type: "text", text: `Base UI State: ${JSON.stringify(canvasState)}` },
          {
            type: "image_url",
            image_url: { url: classDiagram }
          },
          {
            type: "image_url",
            image_url: { url: sequenceDiagram }
          }
        ]
      }
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      messages: messages,
      max_tokens: 4096
    });

    res.json({ code: response.choices[0].message.content });
  } catch (error) {
    console.error('Groq Vision Error:', error);
    res.status(500).json({ error: 'Failed to analyze diagrams' });
  }
});

// Presence tracking handled in yjs-server.js
// Duplicate socket handler removed

setupCollaboration(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', groq: !!process.env.GROQ_API_KEY, timestamp: new Date().toISOString() });
});

// SPA catch-all — express.static handles real files above;
// this only fires for unmatched routes (client-side navigation)
app.get('*all', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
