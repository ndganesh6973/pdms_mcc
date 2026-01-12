import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, IconButton, Avatar 
} from '@mui/material';
import { Trash2, Users, ShieldAlert, UserCog, Clock } from 'lucide-react';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // NOTE: Ensure your backend matches this exact string
      const res = await api.get('/auth/users'); 
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Terminate user access permanently?")) {
      try {
        await api.delete(`/auth/users/${id}`);
        fetchUsers(); 
      } catch (err) {
        alert("Action restricted.");
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8f9fc', minHeight: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4, width: '100%' }}>
        
        {/* ATTRACTIVE HEADER */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
                <Typography variant="h4" fontWeight="900" color="#2D3E50" sx={{ letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: 2 }}>
                   <Users size={32} color="#4e73df" /> Personnel Directory
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="700">Manage plant access and shift assignments</Typography>
            </Box>
            <Chip label={`${users.length} TOTAL USERS`} sx={{ fontWeight: '900', bgcolor: '#4e73df', color: 'white' }} />
        </Box>

        {/* ELEVATED TABLE CONTAINER */}
        
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e3e6f0', boxShadow: '0 .15rem 1.75rem 0 rgba(58,59,69,.15)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, color: '#4e73df' }}>USERNAME</TableCell>
                <TableCell sx={{ fontWeight: 900, color: '#4e73df' }}>EMAIL</TableCell>
                <TableCell sx={{ fontWeight: 900, color: '#4e73df' }}>SECURITY ROLE</TableCell>
                <TableCell sx={{ fontWeight: 900, color: '#4e73df' }}>ASSIGNED SHIFT</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, color: '#4e73df' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: '#f1f4ff' }, transition: '0.2s' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: user.role === 'Admin' ? '#e74a3b' : '#4e73df', width: 32, height: 32, fontSize: '0.9rem', fontWeight: 'bold' }}>
                            {user.username[0].toUpperCase()}
                        </Avatar>
                        <Typography fontWeight="800" color="#5a5c69">{user.username}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#858796', fontWeight: 500 }}>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                        icon={user.role === 'Admin' ? <ShieldAlert size={14}/> : <UserCog size={14}/>}
                        label={user.role.toUpperCase()} 
                        size="small" 
                        sx={{ 
                            fontWeight: '900', 
                            fontSize: '0.65rem',
                            bgcolor: user.role === 'Admin' ? '#fff1f0' : '#eef2ff', 
                            color: user.role === 'Admin' ? '#e74a3b' : '#4e73df',
                            border: '1px solid'
                        }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#5a5c69' }}>
                        <Clock size={14} />
                        <Typography variant="body2" fontWeight="700">Shift {user.shift}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => deleteUser(user.id)} sx={{ '&:hover': { bgcolor: '#fff1f0' } }}>
                      <Trash2 size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                          <Typography variant="body1" color="text.secondary">No users found in database.</Typography>
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default UserList;