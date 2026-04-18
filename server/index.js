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
app.use(express.static(path.join(__dirname, '../client/dist')));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// AI UI Generation Endpoint
app.post('/api/generate-ui', async (req, res) => {
  const { prompt } = req.body;

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
  const { classDiagram, sequenceDiagram, canvasState } = req.body;

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

// Presence tracking (Cursors)
const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // ... rest of socket logic ...
});

setupCollaboration(io);

// Handle any requests that don't match the ones above
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
