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
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});

        // Construct history for Gemini
        // Common format in frontend might be { text: '...', sender: 'user'/'bot' }
        // We need to map that to Gemini's expected format: { role: 'user'|'model', parts: [{ text: '...' }] }
        
        let chatHistory = [];
        if (history && Array.isArray(history)) {
            chatHistory = history.map(h => ({
                role: h.sender === 'user' ? 'user' : 'model',
                parts: [{ text: h.text }]
            }));
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
        // Handle safety ratings blocking or other API errors
        if (error.response && error.response.promptFeedback && error.response.promptFeedback.blockReason) {
             return res.status(400).json({ success: false, error: `Response blocked: ${error.response.promptFeedback.blockReason}` });
        }
        res.status(500).json({ success: false, error: error.message || 'Failed to generate response' });
    }
});

module.exports = router;
