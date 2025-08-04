import { Client, LocalAuth } from 'whatsapp-web.js';
import express from 'express';
import qrcode from 'qrcode';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './session' })
});

let qrData = '';

client.on('qr', async (qr) => {
  qrData = await qrcode.toDataURL(qr);
});

client.on('ready', () => console.log('✅ WhatsApp is ready!'));
client.on('authenticated', () => console.log('🔐 WhatsApp authenticated'));

client.initialize();

app.get('/qr', (req, res) => {
  if (!qrData) return res.send({ qr: null, message: 'Already connected or generating...' });
  res.send({ qr: qrData });
});

app.post('/send-message', async (req, res) => {
  const { to, message } = req.body;
  try {
    await client.sendMessage(to, message);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));
