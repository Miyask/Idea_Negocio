import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data.json');

// Helper to read/write JSON data
async function getData() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return { users: [], flows: [], activities: [] };
  }
}

async function saveData(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json());

  // API Routes
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const data = await getData();
    const user = data.users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  });

  app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;
    const data = await getData();
    if (data.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ success: false, message: 'El usuario ya existe' });
    }
    const newUser = { id: Date.now().toString(), email, password, name };
    data.users.push(newUser);
    await saveData(data);
    res.json({ success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  });

  app.get('/api/flows/:userId', async (req, res) => {
    const { userId } = req.params;
    const data = await getData();
    const userFlows = data.flows.filter((f: any) => f.userId === userId);
    res.json(userFlows);
  });

  app.post('/api/flows', async (req, res) => {
    const flow = req.body;
    const data = await getData();
    const newFlow = { ...flow, id: Date.now().toString(), status: 'Activo', lastRun: 'Hoy ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    data.flows.push(newFlow);
    
    // Add activity
    data.activities.unshift({
      id: Date.now().toString(),
      userId: flow.userId,
      title: `Nuevo flujo: ${flow.name}`,
      time: 'Hace un momento',
      type: 'SYNC',
      status: 'Exitoso'
    });

    await saveData(data);
    res.json(newFlow);
  });

  app.get('/api/activities/:userId', async (req, res) => {
    const { userId } = req.params;
    const data = await getData();
    const userActivities = data.activities.filter((a: any) => a.userId === userId);
    res.json(userActivities);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
