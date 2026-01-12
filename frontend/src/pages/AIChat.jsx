import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, Typography, TextField, Button, Paper, Avatar, 
  CircularProgress, Fade, IconButton 
} from '@mui/material';
import { Bot, Send, User, Sparkles, RefreshCcw } from 'lucide-react';

function AIChat() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'System Online. I am your MCC Plant Assistant. How can I assist with production or QC today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const askAI = async () => {
    if (!query.trim()) return;

    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', { question: query });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error: Unable to reach the AI Core. Check backend connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8f9fc', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        
        {/* HEADER */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="900" color="#2D3E50" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Sparkles color="#4e73df" /> AI ASSISTANT
            </Typography>
            <Typography variant="body2" color="textSecondary" fontWeight="bold">GENAI POWERED PLANT INTELLIGENCE</Typography>
          </Box>
          <Button startIcon={<RefreshCcw size={16}/>} onClick={() => setMessages([])} sx={{ fontWeight: 'bold' }}>Clear Chat</Button>
        </Box>

        {/* CHAT BOX */}
        <Paper elevation={0} sx={{ 
          flexGrow: 1, mb: 3, p: 3, borderRadius: 4, border: '1px solid #e3e6f0', 
          bgcolor: 'white', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2,
          boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1)'
        }} ref={scrollRef}>
          {messages.map((msg, i) => (
            <Fade in key={i}>
              <Box sx={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 2, alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: msg.role === 'user' ? '#4e73df' : '#6f42c1', width: 38, height: 38 }}>
                  {msg.role === 'user' ? <User size={20}/> : <Bot size={20}/>}
                </Avatar>
                <Paper sx={{ 
                  p: 2, borderRadius: 3, maxWidth: '70%',
                  bgcolor: msg.role === 'user' ? '#4e73df' : '#f8f9fc',
                  color: msg.role === 'user' ? 'white' : '#2D3E50',
                  boxShadow: msg.role === 'user' ? '0 4px 12px rgba(78,115,223,0.2)' : 'none',
                  border: msg.role === 'bot' ? '1px solid #e3e6f0' : 'none'
                }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, fontWeight: 500 }}>{msg.text}</Typography>
                </Paper>
              </Box>
            </Fade>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: '#6f42c1', width: 38, height: 38 }}><Bot size={20}/></Avatar>
              <CircularProgress size={20} sx={{ color: '#6f42c1' }} />
              <Typography variant="caption" color="textSecondary">Analysing plant parameters...</Typography>
            </Box>
          )}
        </Paper>

        {/* INPUT AREA */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            fullWidth 
            placeholder="Ask about acid pH levels or pending QC batches..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && askAI()}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}
          />
          <IconButton onClick={askAI} disabled={loading} sx={{ bgcolor: '#4e73df', color: 'white', width: 56, height: 56, '&:hover': { bgcolor: '#2e59d9' } }}>
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default AIChat;