import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { Factory } from 'lucide-react'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); 
      formData.append('password', password);

      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      // ✅ SUCCESS: Saving keys exactly as Sidebar expects
      localStorage.setItem('username', res.data.username || email.split('@')[0]);
      localStorage.setItem('userRole', res.data.role); 
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('username', res.data.username || email.split('@')[0]);
      if (res.data.role) {
        localStorage.setItem('userRole', res.data.role);
      } else {
        console.error("Critical: Role is missing in backend response!");
        localStorage.setItem('userRole', 'Operator');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials or Server Offline.');
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f4f8' }}>
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', p: 2, bgcolor: '#1a237e', borderRadius: '50%', mb: 2 }}>
            <Factory size={40} color="white" />
          </Box>
          <Typography variant="h5" fontWeight="800" color="#1a237e" gutterBottom>MCC PDMS</Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <form onSubmit={handleLogin}>
            <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, bgcolor: '#1a237e' }}>SIGN IN</Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
export default Login;