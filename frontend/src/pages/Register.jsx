import React, { useState } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { Box, Typography, Card, CardContent, TextField, Button, MenuItem } from '@mui/material';
import { UserPlus } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    role: 'Operator', 
    username: '',
    shift: 'A' // Default value
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert('User Registered Successfully!');
      setFormData({ email: '', password: '', role: 'Operator', username: '', shift: 'A' });
    } catch (err) { 
      console.error(err.response?.data);
      alert(err.response?.data?.detail || 'Error registering user'); 
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <UserPlus size={32} /> Register New Employee
        </Typography>

        <Card elevation={3} sx={{ maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <TextField 
                fullWidth label="Full Name (Username)" margin="normal" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                required
              />
              <TextField 
                fullWidth label="Email" type="email" margin="normal" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required
              />
              <TextField 
                fullWidth label="Password" type="password" margin="normal" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required
              />

              <TextField select fullWidth label="Role" margin="normal" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Plant Manager">Plant Manager</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
                <MenuItem value="QC Incharge">QC Incharge</MenuItem>
                <MenuItem value="Operator">Operator</MenuItem>
              </TextField>

              {/* ✅ NEW: Shift Selection Dropdown */}
              <TextField select fullWidth label="Select Shift" margin="normal" value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})}>
                <MenuItem value="A">Shift A</MenuItem>
                <MenuItem value="B">Shift B</MenuItem>
                <MenuItem value="C">Shift C</MenuItem>
              </TextField>

              <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3, bgcolor: '#1a237e' }}>
                CREATE ACCOUNT
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Register;