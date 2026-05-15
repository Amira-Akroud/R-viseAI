const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// !!! حطي الـ API Key ديالك هنا
const genAI = new GoogleGenerativeAI("AIzaSyDkkPTWBxRpkTp8AOHSD1CaVY2XkpaX5UM");

app.post('/generate-quiz', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("Fichier manquant.");

        const dataBuffer = req.file.buffer;
        const pdfData = await pdf(dataBuffer);
        const text = pdfData.text;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Génère un quiz de 3 questions QCM à partir de ce texte. 
        Réponds uniquement en format JSON pur (sans Markdown) comme ceci :
        [{"q": "question", "options": ["opt1", "opt2", "opt3"], "ans": "opt1"}]
        Texte : ${text.substring(0, 5000)}`; // صيفطي غير أول 5000 حرف باش ما يتقالش

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let quizText = response.text().trim();
        
        // تنظيف الرد من أي Markdown زائد
        if (quizText.startsWith("```")) {
            quizText = quizText.replace(/```json|```/g, "");
        }

        res.json(JSON.parse(quizText));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "L'IA a eu un petit bug, réessaie !" });
    }
});

app.listen(5000, () => console.log("🚀 Backend lancé sur http://localhost:5000"));