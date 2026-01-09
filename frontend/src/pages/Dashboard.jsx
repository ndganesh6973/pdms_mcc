import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, Card, Typography, Chip, Table, TableBody, 
  TableCell, TableContainer, TableRow, Skeleton, 
  Button, IconButton, Badge, Menu, MenuItem, Avatar, Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { 
  Activity, AlertTriangle, CheckCircle, Zap, 
  ShieldCheck, Bell, Settings, LogOut 
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    active_batches: 0,
    material_alerts: 0,
    plant_health: 0,
    production_rate: 0,
    status: "CONNECTING...",
    recent_batches: [] 
  });
  
  const [analytics, setAnalytics] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  // Get Session Data
  const username = localStorage.getItem('username') || 'User';
  const userRole = localStorage.getItem('userRole') || 'Operator';
  const isAdmin = userRole.toLowerCase() === 'admin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch KPI Summary
        const summaryRes = await api.get('/dashboard/summary');
        setSummary(summaryRes.data);

        // 2. Fetch Chart Analytics
        const analyticsRes = await api.get('/dashboard/analytics');
        setAnalytics(analyticsRes.data);

        // 3. Fetch Notifications
        const notifyRes = await api.get('/dashboard/notifications');
        setNotifications(notifyRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Dashboard sync error:", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Notification Menu Handlers
  const handleOpenAlerts = (event) => setAnchorEl(event.currentTarget);
  const handleCloseAlerts = () => setAnchorEl(null);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F4F7FE', minHeight: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        
        {/* HEADER BAR: Search, Notifications, Profile */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="900" color="#1E293B">
              Welcome, {username}!
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip 
                icon={isAdmin ? <ShieldCheck size={14} /> : null}
                label={userRole.toUpperCase()} 
                size="small" 
                color={isAdmin ? "primary" : "default"} 
                sx={{ fontWeight: 'bold' }} 
              />
              <Typography variant="body2" color="text.secondary">
                Plant Status: <b style={{ color: '#4CAF50' }}>{summary.status}</b>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notification Bell */}
            <IconButton onClick={handleOpenAlerts}>
              <Badge badgeContent={notifications.filter(n => !n.is_read).length} color="error">
                <Bell size={24} color="#1E293B" />
              </Badge>
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseAlerts} sx={{ mt: 1 }}>
              <Typography sx={{ px: 2, py: 1, fontWeight: 'bold' }}>Alerts Center</Typography>
              <Divider />
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <MenuItem key={n.id} onClick={handleCloseAlerts} sx={{ maxWidth: 300, py: 1.5 }}>
                    <Box>
                      <Typography variant="body2" fontWeight="600">{n.message}</Typography>
                      <Typography variant="caption" color="text.secondary">{n.timestamp}</Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem>No new notifications</MenuItem>
              )}
            </Menu>

            {/* Admin Controls */}
            {isAdmin && (
              <Button variant="contained" color="error" startIcon={<AlertTriangle size={18} />} sx={{ borderRadius: '10px' }}>
                EMERGENCY STOP
              </Button>
            )}
            
            <Avatar sx={{ bgcolor: '#7b1fa2', fontWeight: 'bold' }}>{username[0].toUpperCase()}</Avatar>
          </Box>
        </Box>

        {/* KPI CARDS: Real-time Data */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <KPICard title="Active Batches" value={loading ? <Skeleton width={40} /> : summary.active_batches} color="#E8F2FF" icon={<Activity color="#2196F3"/>} />
          <KPICard title="Material Alerts" value={loading ? <Skeleton width={40} /> : summary.material_alerts} color="#FFF4E5" icon={<AlertTriangle color="#FF9800"/>} />
          <KPICard title="Plant Health" value={loading ? <Skeleton width={40} /> : `${summary.plant_health}%`} color="#EBF9F1" icon={<CheckCircle color="#4CAF50"/>} />
          <KPICard title="Production Rate" value={loading ? <Skeleton width={40} /> : `${summary.production_rate} kg/h`} color="#F4F4F4" icon={<Zap color="#607D8B"/>} />
        </Grid>

        <Grid container spacing={3}>
          {/* PRODUCTION CHART: Analytics Data */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: 'none' }}>
              <Typography variant="h6" fontWeight="800" mb={3} color="#1E293B">Yield Forecast vs Actual</Typography>
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics}>
                    <defs>
                      <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7b1fa2" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7b1fa2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="output" stroke="#7b1fa2" strokeWidth={3} fillOpacity={1} fill="url(#colorOutput)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* LIVE MONITOR: Recent Batches */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: '20px', minHeight: 400, boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: 'none' }}>
              <Typography variant="h6" fontWeight="800" mb={2} color="#1E293B">Live Batch Monitor</Typography>
              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableBody>
                    {summary.recent_batches?.length > 0 ? (
                      summary.recent_batches.map((batch, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ border: 0, px: 0, py: 2 }}>
                            <Typography variant="body2" fontWeight="700" color="#1E293B">{batch.batch_number}</Typography>
                            <Typography variant="caption" color="text.secondary">{batch.phase}</Typography>
                          </TableCell>
                          <TableCell sx={{ border: 0 }} align="right">
                            <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#EBF9F1', color: '#4CAF50', fontWeight: '900', fontSize: '0.65rem' }} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ border: 0, py: 10 }}>
                          <Typography variant="body2" color="text.secondary">No active batches detected.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

function KPICard({ title, value, color, icon }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ p: 3, borderRadius: '20px', bgcolor: color, border: 'none', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight="700" sx={{ mb: 0.5 }}>{title}</Typography>
            <Typography variant="h4" fontWeight="900" color="#1E293B">{value}</Typography>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: '#FFF', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            {icon}
          </Box>
        </Box>
      </Card>
    </Grid>
  );
}

export default Dashboard;