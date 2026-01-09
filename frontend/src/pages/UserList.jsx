import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton } from '@mui/material';
import { Trash2, Users } from 'lucide-react';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users'); // Ensure you create this endpoint in FastAPI
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/auth/users/${id}`);
        fetchUsers(); // Refresh list
      } catch (err) {
        alert("Error deleting user");
      }
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: '#f5f5f5' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Users size={32} /> Personnel Management
        </Typography>

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: '#1a237e' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Username</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Shift</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} color={user.role === 'Admin' ? 'error' : 'primary'} size="small" />
                  </TableCell>
                  <TableCell><b>Shift {user.shift}</b></TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => deleteUser(user.id)}>
                      <Trash2 size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default UserList;