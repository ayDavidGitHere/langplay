// app.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { SentenceGenerator } = require('./SentenceGenerator'); // Adjust the path accordingly

const app = express();
const port = 7006; // You can choose any available port

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Serve static files from the "./public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate/sentence/from', async (req, res) => {
    const currentSentence = req.body.currentSentence;
    const numberOfResults = req.body.numberOfResults || 5; // Default to 5 if not provided
    const langOptions = { sourceLang: req.body.sourceLang ?? "en", targetLang: req.body.targetLang }

    // Perform your logic here to generate sentences based on the currentSentence
    const generatedSentences = await SentenceGenerator.get(currentSentence, numberOfResults, langOptions);

    // Respond with the generated sentences in JSON format
    res.json({ items: generatedSentences }); 
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
