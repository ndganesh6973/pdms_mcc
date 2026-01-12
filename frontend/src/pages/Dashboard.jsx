import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, Typography, Grid, Card, CardActionArea, Paper, Divider, Chip, List, ListItem, ListItemText 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Database, Settings, ClipboardList, Truck, 
  ShieldCheck, Clock, Activity, ListFilter
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    summary: { production: {}, qc: {}, inventory: {}, dispatch: {} },
    analytics: [],
    logs: [], // This will hold your real notifications
    loading: true
  });

  const colors = {
    primary: "#4e73df",
    success: "#1cc88a",
    info: "#36b9cc",
    warning: "#f6c23e",
    danger: "#e74a3b",
    bg: "#f8f9fc"
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryRes, analyticsRes, logsRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/analytics'),
          api.get('/dashboard/notifications') // Fetching real logs
        ]);
        
        setData({ 
          summary: summaryRes.data, 
          analytics: analyticsRes.data, 
          logs: logsRes.data || [], 
          loading: false 
        });
      } catch (err) {
        console.error("Sync Error", err);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchAll();
  }, []);

  return (
    <Box sx={{ display: 'flex', bgcolor: colors.bg, minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      
      {/* MAIN CONTENT AREA */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%', overflowX: 'hidden' }}>
        
        {/* HEADER SECTION */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="900" color="#5a5c69" sx={{ letterSpacing: '-1px' }}>
              CENTRAL COMMAND
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="700">
              SYSTEM ONLINE • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Chip 
            icon={<ShieldCheck size={16} />} 
            label="ENCRYPTED SESSION" 
            sx={{ fontWeight: '900', bgcolor: 'white', border: '1px solid #e3e6f0', color: colors.primary }} 
          />
        </Box>

        {/* 1. TOP CARDS (Row of 4) */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <NavCard title="Production" icon={<Settings size={26} color={colors.primary}/>} path="/production" active={data.summary.production?.active || 0} waiting={data.summary.production?.waiting || 0} color={colors.primary} />
          {/* CORRECTED PATH: /qc matches App.js lowercase route */}
          <NavCard title="Quality Control" icon={<ClipboardList size={26} color={colors.success}/>} path="/qc" active={data.summary.qc?.active || 0} waiting={data.summary.qc?.waiting || 0} color={colors.success} />
          <NavCard title="Inventory" icon={<Database size={26} color={colors.info}/>} path="/inventory" active={data.summary.inventory?.active || 0} waiting={data.summary.inventory?.waiting || 0} color={colors.info} />
          <NavCard title="Dispatch" icon={<Truck size={26} color={colors.warning}/>} path="/dispatch" active={data.summary.dispatch?.active || 0} waiting={data.summary.dispatch?.waiting || 0} color={colors.warning} />
        </Grid>

        {/* 2. CORE LOGS & ANALYTICS (Perfect 50/50 Split) */}
        <Grid container spacing={2} sx={{ height: 'calc(100vh - 250px)' }}>
          
          {/* DAILY PRODUCTION LOG (LEFT HALF) */}
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e3e6f0', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Activity size={20} color={colors.primary} />
                <Typography variant="h6" fontWeight="800" color="#5a5c69">Daily Production Yield</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.analytics} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e6f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#858796', fontSize: 11, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#858796', fontSize: 11}} />
                    <Tooltip cursor={{fill: '#f8f9fc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="output" radius={[6, 6, 0, 0]} barSize={45}>
                      {data.analytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors.primary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* A to Z ACTIVITY LOG (RIGHT HALF) */}
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e3e6f0', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ListFilter size={20} color={colors.primary} />
                    <Typography variant="h6" fontWeight="800" color="#5a5c69">A to Z Activity Log</Typography>
                </Box>
                <Chip label="Real-time" size="small" sx={{ fontWeight: 'bold', fontSize: '0.65rem', color: colors.success, bgcolor: '#e1f9ed' }} />
              </Box>
              <Box sx={{ 
                flexGrow: 1, 
                overflowY: 'auto', 
                pr: 1, 
                '&::-webkit-scrollbar': { width: '6px' }, 
                '&::-webkit-scrollbar-thumb': { bgcolor: '#d1d3e2', borderRadius: '10px' } 
              }}>
                <List disablePadding>
                  {/* Map through real logs if they exist, otherwise show fallback */}
                  {data.logs.length > 0 ? data.logs.map((log, index) => (
                    <FullLogItem 
                      key={index}
                      time={new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                      user={log.user || "System"} 
                      action={log.message} 
                      color={log.type === 'alert' ? colors.danger : colors.primary} 
                    />
                  )) : (
                    <Box sx={{ textAlign: 'center', mt: 10, opacity: 0.5 }}>
                        <Typography variant="body2">No recent activities found.</Typography>
                    </Box>
                  )}
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

// --------------------------------------------------------------------------------------

function NavCard({ title, icon, path, active, waiting, color }) {
  const navigate = useNavigate();
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ borderRadius: 2, border: '1px solid #e3e6f0', boxShadow: 'none', transition: '0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 .3rem .8rem rgba(0,0,0,.05)' } }}>
        <CardActionArea onClick={() => navigate(path)} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ p: 1, bgcolor: `${color}10`, borderRadius: 1.5, display: 'flex' }}>{icon}</Box>
            <Typography variant="subtitle2" fontWeight="900" color="#5a5c69">{title.toUpperCase()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box align="center">
              <Typography variant="h5" fontWeight="900" color="#1E293B">{active}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{fontSize: '0.6rem'}}>ACTIVE</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box align="center">
              <Typography variant="h5" fontWeight="900" color={color}>{waiting}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{fontSize: '0.6rem'}}>QUEUED</Typography>
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    </Grid>
  );
}

function FullLogItem({ time, user, action, color }) {
    return (
        <ListItem sx={{ px: 0, py: 1.2, borderBottom: '1px solid #f8f9fc' }}>
            <Box sx={{ width: 4, height: 32, bgcolor: color, borderRadius: 1.5, mr: 2, flexShrink: 0 }} />
            <ListItemText 
                primary={<Typography variant="body2" fontWeight="800" color="#4a4b57" sx={{fontSize: '0.85rem'}}>{action}</Typography>}
                secondary={
                    <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3}}>
                        <Clock size={11} /> {time} • <span style={{fontWeight: 'bold', color: '#858796'}}>{user.toUpperCase()}</span>
                    </Typography>
                }
            />
        </ListItem>
    );
}

export default Dashboard;