const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// ======= SQLite =======
const db = new Database('reviseai.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);
console.log('SQLite connecté');

// ======= Groq AI =======
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// ======= REGISTER =======
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email et mot de passe requis" });

    const exists = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (exists) return res.status(400).json({ message: "Email déjà utilisé" });

    const hashed = await bcrypt.hash(String(password), 10);
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashed);
    const token = jwt.sign({ id: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: result.lastInsertRowid, name, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ======= LOGIN =======
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ message: "Email introuvable" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ======= GENERATE QUIZ =======
app.post('/generate-quiz', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).send("Fichier manquant.");

    let fullText = '';
    for (const file of req.files) {
      const pdfData = await pdfParse(file.buffer);
      fullText += pdfData.text + '\n\n';
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Tu es un générateur de quiz. Tu réponds UNIQUEMENT avec du JSON valide, sans markdown, sans texte supplémentaire."
        },
        {
          role: "user",
          content: `Génère exactement 20 questions QCM à partir de ce texte.
Réponds UNIQUEMENT avec ce format JSON (rien d'autre):
[{"q": "Question?", "options": ["A", "B", "C"], "ans": "A"}]

Texte: ${fullText.substring(0, 6000)}`
        }
      ]
    });

    let quizText = completion.choices[0].message.content.trim();
    
    // Nettoyer le texte pour extraire le JSON
    quizText = quizText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Extraire l'array JSON
    const jsonMatch = quizText.match(/\[[\s\S]*\]/);
    if (jsonMatch) quizText = jsonMatch[0];
    
    console.log('Quiz généré:', quizText.substring(0, 200));
    
    const parsed = JSON.parse(quizText);
    res.json(parsed);

  } catch (err) {
    console.error('Erreur:', err.message);
    res.status(500).json({ error: "Erreur lors de la génération du quiz" });
  }
});

// ======= START =======
app.listen(5000, () => console.log("Backend lancé sur http://localhost:5000"));
app.listen(5000, '0.0.0.0', () => {
  console.log("Backend running");
});