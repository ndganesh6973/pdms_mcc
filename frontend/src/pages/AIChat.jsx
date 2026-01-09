import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, 
  Typography, 
  Card, 
  TextField, 
  Button, 
  Paper, 
  Avatar, 
  CircularProgress 
} from '@mui/material';
import { Bot, Send, User } from 'lucide-react';

function AIChat() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]); // Array to hold conversation history
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to the bottom of the chat when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const askAI = async () => {
    if (!query.trim()) return;

    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      // API call to your FastAPI Gemini/OpenAI wrapper
      const res = await api.post('/ai/ask', { question: query });
      
      const aiMessage = { role: 'bot', text: res.data.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = { role: 'bot', text: 'Connection Error: Unable to reach the AI Plant Assistant.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') askAI();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Bot size={32} color="#1976d2" /> AI Plant Assistant
        </Typography>

        <Card elevation={3} sx={{ height: '75vh', display: 'flex', flexDirection: 'column', p: 2, borderRadius: 3 }}>
          
          {/* Chat Display Area */}
          <Box 
            ref={scrollRef}
            sx={{ 
              flexGrow: 1, 
              bgcolor: '#f0f4f8', 
              borderRadius: 2, 
              p: 3, 
              overflowY: 'auto', 
              mb: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 10 }}>
                <Bot size={48} color="#90caf9" style={{ marginBottom: '16px' }} />
                <Typography color="text.secondary">
                  Ask me about production schedules, inventory levels, or QC status.
                </Typography>
              </Box>
            ) : (
              messages.map((msg, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    gap: 1.5,
                    alignItems: 'flex-start'
                  }}
                >
                  <Avatar sx={{ bgcolor: msg.role === 'user' ? '#1976d2' : '#7b1fa2', width: 32, height: 32 }}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </Avatar>
                  <Paper 
                    elevation={1}
                    sx={{ 
                      p: 2, 
                      maxWidth: '75%', 
                      borderRadius: 2,
                      bgcolor: msg.role === 'user' ? '#e3f2fd' : 'white'
                    }}
                  >
                    <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                      {msg.text}
                    </Typography>
                  </Paper>
                </Box>
              ))
            )}
            
            {loading && (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#7b1fa2', width: 32, height: 32 }}><Bot size={18} /></Avatar>
                <CircularProgress size={20} thickness={5} />
                <Typography variant="caption" color="text.secondary">AI is analyzing plant data...</Typography>
              </Box>
            )}
          </Box>

          {/* User Input Section */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField 
              fullWidth 
              placeholder="Ask the MCC Assistant..." 
              variant="outlined"
              value={query} 
              autoComplete="off"
              onChange={(e) => setQuery(e.target.value)} 
              onKeyPress={handleKeyPress}
              disabled={loading}
              sx={{ bgcolor: 'white' }}
            />
            <Button 
              variant="contained" 
              size="large" 
              onClick={askAI} 
              disabled={loading || !query.trim()}
              sx={{ px: 4, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : <Send size={20} />}
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

export default AIChat;