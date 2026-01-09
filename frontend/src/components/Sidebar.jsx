import React from 'react';
import {
  Box, Typography, Divider, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Button, Paper, Avatar
} from '@mui/material';
import {
  LayoutDashboard, Package, Factory, FlaskConical,
  BrainCircuit, Boxes, LogOut, Settings, 
  UserPlus, Users, ShieldCheck, Bot, Send, User, ChevronRight, Activity
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const username = localStorage.getItem('username') || 'User';
  const rawRole = localStorage.getItem('userRole') || 'Operator';

  const normalizeRole = (role) => {
    if (!role) return 'Operator';
    return role.trim().toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const userRole = normalizeRole(rawRole);
  const isAdmin = userRole === 'Admin';

  // --- REARRANGED ACCORDING TO COMPANY HIERARCHY ---
  const coreMenu = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['Admin', 'Plant Manager', 'Supervisor', 'QC Incharge', 'Operator'] },
    { text: 'Production', icon: <Factory size={20} />, path: '/production', roles: ['Admin', 'Plant Manager', 'Supervisor', 'Operator'] },
    { text: 'Quality Control', icon: <FlaskConical size={20} />, path: '/qc', roles: ['Admin', 'Plant Manager', 'QC Incharge', 'Operator'] },
    { text: 'Inventory', icon: <Boxes size={20} />, path: '/inventory', roles: ['Admin', 'Plant Manager', 'Supervisor', 'Operator'] },
    { text: 'Dispatch', icon: <Send size={20} />, path: '/dispatch', roles: ['Admin', 'Plant Manager', 'Logistics'] },
  ];

  const technicalMenu = [
    { text: 'Materials', icon: <Package size={20} />, path: '/materials', roles: ['Admin', 'Plant Manager', 'Supervisor'] },
    { text: 'Maintenance', icon: <Settings size={20} />, path: '/maintenance', roles: ['Admin', 'Plant Manager', 'Supervisor'] },
    { text: 'Intelligence', icon: <BrainCircuit size={20} />, path: '/intelligence', roles: ['Admin', 'Plant Manager'] },
    { text: 'AI Assistant', icon: <Bot size={20} />, path: '/ai', roles: ['Admin', 'Plant Manager', 'Supervisor', 'Operator'] },
  ];

  const adminMenu = [
    { text: 'View Users', icon: <Users size={20} />, path: '/users' },
    { text: 'Register Personnel', icon: <UserPlus size={20} />, path: '/register' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const renderMenuItem = (item) => {
    const isSelected = location.pathname === item.path;
    return (
      <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          onClick={() => navigate(item.path)}
          selected={isSelected}
          sx={{
            borderRadius: '8px',
            mx: 1.5,
            transition: 'all 0.2s ease',
            // Page names are now deep charcoal (#2c3e50) when not selected for better visibility
            color: isSelected ? '#ffffff' : '#2c3e50', 
            bgcolor: isSelected ? '#1a237e' : 'transparent',
            '&.Mui-selected': {
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#0d47a1' },
            },
            '&:hover': { 
              bgcolor: 'rgba(26, 35, 126, 0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ 
            color: isSelected ? '#ffffff' : '#546e7a', 
            minWidth: 40 
          }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.text} 
            primaryTypographyProps={{ 
              fontSize: '0.88rem', 
              fontWeight: isSelected ? 700 : 600, // Bold letters as requested
              letterSpacing: '0.3px'
            }} 
          />
          {isSelected && <ChevronRight size={14} />}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box sx={{ 
      width: 280, 
      height: '100vh', 
      bgcolor: '#ffffff', // Clean white background for industrial contrast
      display: 'flex', 
      flexDirection: 'column', 
      position: 'sticky', 
      top: 0,
      borderRight: '2px solid #eceff1'
    }}>
      {/* --- COMPANY BRANDING --- */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ bgcolor: '#1a237e', p: 1, borderRadius: '8px' }}>
          <Activity color="white" size={24} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1a237e', lineHeight: 1 }}>
            MCC PDMS
          </Typography>
          <Typography variant="caption" sx={{ color: '#90a4ae', fontWeight: 800, fontSize: '0.65rem' }}>
            INDUSTRIAL ECOSYSTEM
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2, mx: 2 }} />

      {/* --- USER PROFILE SECTION --- */}
      <Box sx={{ px: 2, mb: 3 }}>
        <Paper elevation={0} sx={{ 
          p: 2, 
          bgcolor: '#f8fafc', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          border: '1px solid #e2e8f0'
        }}>
          <Avatar sx={{ bgcolor: '#1a237e', width: 36, height: 36 }}>
            <User size={18} />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="800" sx={{ color: '#1e293b' }}>
               {username.toUpperCase()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ShieldCheck size={12} /> {userRole}
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {/* GROUP 1: CORE OPERATIONS */}
        <Typography variant="caption" sx={{ px: 4, mb: 1, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900, fontSize: '0.7rem', display: 'block' }}>
          Core Operations
        </Typography>
        <List sx={{ mb: 2 }}>{coreMenu.filter(i => i.roles.includes(userRole)).map(renderMenuItem)}</List>

        {/* GROUP 2: TECHNICAL & INTEL */}
        <Typography variant="caption" sx={{ px: 4, mb: 1, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900, fontSize: '0.7rem', display: 'block' }}>
          Technical & Intelligence
        </Typography>
        <List sx={{ mb: 2 }}>{technicalMenu.filter(i => i.roles.includes(userRole)).map(renderMenuItem)}</List>

        {/* GROUP 3: ADMINISTRATION */}
        {isAdmin && (
          <>
            <Typography variant="caption" sx={{ px: 4, mb: 1, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900, fontSize: '0.7rem', display: 'block' }}>
              System Admin
            </Typography>
            <List>{adminMenu.map(renderMenuItem)}</List>
          </>
        )}
      </Box>

      {/* --- LOGOUT SECTION --- */}
      <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9' }}>
        <Button 
          fullWidth 
          variant="text" 
          onClick={handleLogout} 
          startIcon={<LogOut size={18} />}
          sx={{ 
            color: '#ef4444', 
            justifyContent: 'flex-start', 
            px: 2, 
            fontWeight: 800, 
            '&:hover': { bgcolor: '#fef2f2' } 
          }}
        >
          Logout Session
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;