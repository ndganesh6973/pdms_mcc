import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Chip, Grid, TextField, LinearProgress, Alert, Tooltip
} from '@mui/material';
import { Settings, Plus, Activity, AlertTriangle, ShieldCheck, Wrench, RefreshCcw } from 'lucide-react';

function Maintenance() {
  const [assets, setAssets] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [newAsset, setNewAsset] = useState({ name: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  const fetchMaintenanceData = async () => {
    setLoading(true);
    try {
      const assetRes = await api.get('/maintenance/assets');
      const riskRes = await api.get('/maintenance/risk-report');
      setAssets(assetRes.data);
      setRiskData(riskRes.data);
    } catch (err) { 
      console.error("Maintenance sync failed", err); 
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!newAsset.name || !newAsset.type) return;
    try {
      await api.post('/maintenance/register', newAsset);
      setNewAsset({ name: '', type: '' });
      fetchMaintenanceData();
    } catch (err) { alert("Registration failed"); }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f7fe', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" fontWeight="900" color="#1e293b" display="flex" alignItems="center" gap={2}>
            <Settings size={32} color="#1a237e" /> Equipment & Predictive Maintenance
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<RefreshCcw size={18} className={loading ? "animate-spin" : ""} />} 
            onClick={fetchMaintenanceData}
          >
            Refresh Data
          </Button>
        </Box>

        <Grid container spacing={3} mb={4}>
          {/* Quick Registration Form */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: '16px', height: '100%' }}>
              <Typography variant="h6" fontWeight="800" mb={2}>Register New Asset</Typography>
              <TextField 
                fullWidth label="Equipment Name (e.g. Reactor-101)" size="small" sx={{ mb: 2 }} 
                value={newAsset.name} onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
              />
              <TextField 
                fullWidth label="Type (e.g. Hydrolysis Tank)" size="small" sx={{ mb: 2 }} 
                value={newAsset.type} onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}
              />
              <Button fullWidth variant="contained" startIcon={<Plus />} onClick={handleRegister} sx={{ bgcolor: '#1a237e' }}>
                Register Machine
              </Button>
            </Paper>
          </Grid>

          {/* ML-Based Risk Summary */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: '16px', borderLeft: '8px solid #ed6c02', height: '100%' }}>
              <Typography variant="subtitle2" color="textSecondary" fontWeight="900" display="flex" alignItems="center" gap={1} mb={2}>
                <AlertTriangle size={16} /> ML-BASED FAILURE RISK ANALYSIS
              </Typography>
              <Box>
                {riskData.filter(r => r.status === "Critical").length > 0 ? (
                  <Alert severity="error" variant="filled" sx={{ borderRadius: '8px', fontWeight: 'bold' }}>
                    Critical Attention Required: {riskData.filter(r => r.status === "Critical").length} unit(s) show abnormal vibration/thermal patterns.
                  </Alert>
                ) : (
                  <Alert icon={<ShieldCheck />} severity="success" sx={{ borderRadius: '8px' }}>
                    Plant Stability Verified: All machinery operating within nominal parameters.
                  </Alert>
                )}
              </Box>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Active Assets: {assets.length}</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="caption" color="textSecondary">Last ML Sync: {new Date().toLocaleTimeString()}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Predictive Maintenance Registry Table */}
        <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900 }}>Asset Tracking</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Machine Name</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Sensor Status (Risk)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>Operational Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map((asset) => {
                const riskInfo = riskData.find(r => r.id === asset.id) || { risk_score: 10, status: 'Stable' };
                return (
                  <TableRow key={asset.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>#MCC-{asset.id.toString().padStart(3, '0')}</TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="700">{asset.name}</Typography>
                      <Typography variant="caption" color="textSecondary">{asset.type}</Typography>
                    </TableCell>
                    <TableCell sx={{ width: '25%' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress 
                          variant="determinate" 
                          value={riskInfo.risk_score} 
                          sx={{ flexGrow: 1, height: 8, borderRadius: 5, bgcolor: '#e2e8f0' }}
                          color={riskInfo.risk_score > 75 ? "error" : riskInfo.risk_score > 40 ? "warning" : "primary"}
                        />
                        <Typography variant="caption" fontWeight="bold">{riskInfo.risk_score}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={riskInfo.status} 
                        color={riskInfo.status === "Critical" ? "error" : "success"}
                        size="small" sx={{ fontWeight: 900, minWidth: '80px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Log Service Record">
                        <Button variant="outlined" size="small" startIcon={<Wrench size={14} />}>
                          Service
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default Maintenance;