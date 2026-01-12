import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, Typography, TextField, Button, Card, CardContent, Grid, 
  MenuItem, Chip, Alert, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Autocomplete, Tooltip
} from '@mui/material';
import { Factory, Play, Clock, ShieldCheck, CheckCircle, User, Zap } from 'lucide-react';

function Production() {
  const username = localStorage.getItem('username') || 'GANESH';
  const [activeBatches, setActiveBatches] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  
  const [form, setForm] = useState({
    batch_number: '',
    phase: 'Acid Hydrolysis',
    raw_material_name: '',
    quantity_to_use: '',
    shift: 'Shift A'
  });

  const stages = ['Pre-treatment', 'Acid Hydrolysis', 'Washing & Neutralization', 'Spray Drying', 'Milling', 'Packaging'];

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const matRes = await api.get('/materials/search?query=');
      setMaterials(matRes.data);
      const batchRes = await api.get('/production/active-batches');
      setActiveBatches(batchRes.data);
    } catch (err) { 
      setStatusMsg({ type: 'error', text: 'Failed to sync with system.' });
    }
  };

  // NEW: HANDLE END BATCH & MOVE TO QC
  const handleEndBatch = async (batchId, batchNumber) => {
    try {
      // Endpoint logic: This should update ProductionBatch status to 'COMPLETED' 
      // and trigger a QCRecord creation in the backend.
      await api.post(`/production/end-batch/${batchId}`);
      
      setStatusMsg({ 
        type: 'success', 
        text: `Batch ${batchNumber} production complete. Moved to QC Lab.` 
      });
      fetchInitialData(); // Refresh list
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error closing batch.' });
    }
  };

  const handleStartProduction = async () => {
    if (!form.batch_number || !form.raw_material_name || !form.quantity_to_use) {
      setStatusMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    try {
      const payload = { ...form, quantity_to_use: Number(form.quantity_to_use), authorized_by: username };
      await api.post('/production/start-batch', payload);
      setStatusMsg({ type: 'success', text: `Batch ${form.batch_number} started.` });
      setForm({ ...form, batch_number: '', quantity_to_use: '', raw_material_name: '' });
      fetchInitialData(); 
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Execution Error' });
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f1f5f9', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
                <Typography variant="h4" fontWeight="900" color="#1e293b">Production Floor</Typography>
                <Typography variant="body2" color="textSecondary">Manage MCC Production Batches & Authorization</Typography>
            </Box>
            <Chip icon={<Zap size={14} color="#eab308"/>} label="LIVE STATUS: OPERATIONAL" sx={{ fontWeight: 'bold', bgcolor: '#fefce8', color: '#854d0e', border: '1px solid #fde047' }} />
        </Box>

        {statusMsg.text && <Alert severity={statusMsg.type} sx={{ mb: 3, borderRadius: '12px', fontWeight: 'bold' }}>{statusMsg.text}</Alert>}

        <Grid container spacing={3}>
          {/* LEFT: AUTHORIZATION FORM */}
          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', position: 'sticky', top: 20 }}>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldCheck size={20} color="#1a237e" />
                <Typography variant="subtitle1" fontWeight="900">Authorize Batch Start</Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <TextField fullWidth label="Batch Number" value={form.batch_number} onChange={e => setForm({...form, batch_number: e.target.value})} sx={{ mb: 3 }} />
                
                <Typography variant="caption" color="primary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>SELECT RAW MATERIAL</Typography>
                <Autocomplete
                  options={materials}
                  getOptionLabel={(option) => `${option.material_name} (${option.quantity_kg} kg available)`}
                  onChange={(e, val) => setForm({...form, raw_material_name: val?.material_name || ''})}
                  renderInput={(params) => (
                    <TextField {...params} label="Search Material Master..." variant="outlined" 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#f0f4ff' } }} 
                    />
                  )}
                />

                <Typography variant="caption" color="textSecondary" mt={3} display="block" fontWeight="bold">CURRENT STAGE</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3, mt: 1 }}>
                  {stages.map(s => (
                    <Chip key={s} label={s} onClick={() => setForm({...form, phase: s})} color={form.phase === s ? 'primary' : 'default'} sx={{ fontWeight: 'bold', borderRadius: '8px' }} />
                  ))}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField fullWidth type="number" label="Qty (kg)" value={form.quantity_to_use} onChange={e => setForm({...form, quantity_to_use: e.target.value})} /></Grid>
                  <Grid item xs={6}>
                    <TextField select fullWidth label="Shift" value={form.shift} onChange={e => setForm({...form, shift: e.target.value})}>
                      <MenuItem value="Shift A">Shift A</MenuItem><MenuItem value="Shift B">Shift B</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Button fullWidth variant="contained" sx={{ mt: 4, height: 50, borderRadius: '10px', fontWeight: '900', bgcolor: '#1a237e' }} startIcon={<Play />} onClick={handleStartProduction}>START BATCH</Button>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT: LIVE MONITOR (RE-DESIGNED) */}
          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '600px' }}>
              <Box sx={{ p: 2, bgcolor: '#1a237e', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography fontWeight="900" display="flex" alignItems="center" gap={1}><Clock size={18} /> Production Line Monitor</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Showing {activeBatches.length} Active Batches</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900 }}>Batch ID</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>Stage</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>Shift</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>Started At</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>Approved By</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900 }}>Control</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeBatches.map((batch) => (
                      <TableRow key={batch.id} hover>
                        <TableCell sx={{ fontWeight: 800, color: '#1a237e' }}>{batch.batch_number}</TableCell>
                        <TableCell>
                            <Chip label={batch.phase} size="small" variant="outlined" sx={{ fontWeight: 'bold', borderColor: '#1a237e', color: '#1a237e' }} />
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2" fontWeight="600">{batch.shift || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2" color="textSecondary">
                                {batch.created_at ? new Date(batch.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <User size={14} color="#64748b" />
                                <Typography variant="body2" fontWeight="700" color="#475569">{batch.authorized_by || 'SYSTEM'}</Typography>
                            </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Finish Production & Send to QC Lab">
                            <Button 
                                variant="contained" 
                                color="success" 
                                size="small" 
                                sx={{ borderRadius: '6px', fontWeight: 'bold' }}
                                startIcon={<CheckCircle size={14}/>}
                                onClick={() => handleEndBatch(batch.id, batch.batch_number)}
                            >
                                END BATCH
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {activeBatches.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 10, color: 'text.secondary' }}>
                                No active production batches. Authorize a new batch to start.
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

export default Production;