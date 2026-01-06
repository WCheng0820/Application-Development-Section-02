const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'AI service not configured (Missing API Key)' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Add a 1.5s delay to avoid hitting rate limits on the free tier
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Using gemini-flash-latest which is a stable alias for the newest flash model
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest"});

        // Construct history for Gemini
        let chatHistory = [];
        if (history && Array.isArray(history)) {
            chatHistory = history.map(h => ({
                role: h.sender === 'user' ? 'user' : 'model',
                parts: [{ text: h.text }]
            }));

            // Gemini history must start with a user message
            // If the first message is from model (e.g. initial greeting), remove it.
            while (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
                chatHistory.shift();
            }
        }

        const chat = model.startChat({
            history: chatHistory,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, text });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate response' });
    }
});

module.exports = router;
