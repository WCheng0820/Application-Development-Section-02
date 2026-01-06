import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Fab, Paper, TextField, IconButton, Typography, 
  CircularProgress, Collapse 
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get token (if you want to secure this route later, though current backend implementation is public mainly)
function getToken() {
  return sessionStorage.getItem('mlt_session_token');
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your AI study assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setLoading(true);

    try {
      // Send chat history for context
      const history = messages.map(m => ({ 
        text: m.text, 
        sender: m.sender 
      }));

      const config = {
        headers: { Authorization: `Bearer ${getToken()}` }
      };

      const res = await axios.post(`${API_URL}/api/ai/chat`, {
        message: userMsg,
        history: history
      }, config);

      if (res.data.success) {
        setMessages(prev => [...prev, { text: res.data.text, sender: 'bot' }]);
      }
    } catch (err) {
      console.error(err);
      let errorMsg = "Sorry, I'm having trouble connecting right now.";
      if (err.response && err.response.data && err.response.data.error) {
          if (err.response.data.error.includes("Missing API Key")) {
              errorMsg = "AI service is not configured (Missing API Key).";
          } else {
              errorMsg = `Error: ${err.response.data.error}`;
          }
      }
      setMessages(prev => [...prev, { text: errorMsg, sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <Collapse in={isOpen} sx={{ 
        position: 'fixed', 
        bottom: 90, 
        right: 20, 
        zIndex: 1200, // Higher than FAB
        width: 350,
        maxHeight: 500
      }}>
        <Paper elevation={6} sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: 450, 
          overflow: 'hidden',
          borderRadius: 4,
          border: '1px solid rgba(0,0,0,0.08)'
        }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)', 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 0.5, borderRadius: '50%' }}>
                <SmartToyIcon />
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">AI Assistant</Typography>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#f8f9fa' }}>
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ 
                display: 'flex', 
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}>
                <Paper sx={{ 
                  p: 1.5, 
                  px: 2,
                  maxWidth: '85%', 
                  bgcolor: msg.sender === 'user' ? '#1976d2' : 'white',
                  color: msg.sender === 'user' ? 'white' : 'text.primary',
                  borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                    {msg.sender === 'bot' ? (
                        <Box sx={{ '& p': { m: 0 }, '& strong': { fontWeight: 600 } }}>
                           <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </Box>
                    ) : (
                        <Typography variant="body2">{msg.text}</Typography>
                    )}
                </Paper>
              </Box>
            ))}
            {loading && (
               <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
                 <Paper sx={{ p: 1.5, bgcolor: 'white', borderRadius: '20px 20px 20px 4px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                   <CircularProgress size={16} />
                 </Paper>
               </Box>
            )}
            <div ref={scrollRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: '1px solid #eee' }}>
            <Box display="flex" gap={1} alignItems="center">
              <TextField 
                fullWidth 
                size="small" 
                placeholder="Ask me anything..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: '#f5f5f5',
                        '& fieldset': { border: 'none' }
                    }
                }}
              />
              <IconButton 
                color="primary" 
                onClick={handleSend} 
                disabled={loading || !input.trim()}
                sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    width: 40,
                    height: 40,
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' }
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Floating Button */}
      <Fab 
        color="primary" 
        aria-label="chat" 
        sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            zIndex: 1000,
            background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ExpandMoreIcon /> : <SmartToyIcon />}
      </Fab>
    </>
  );
}
