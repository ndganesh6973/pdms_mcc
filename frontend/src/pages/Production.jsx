import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, Typography, TextField, Button, Card, CardContent, Grid, 
  MenuItem, Chip, Alert, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Divider, Autocomplete
} from '@mui/material';
import { Factory, Play, Clock, ShieldCheck, CheckCircle, Search } from 'lucide-react';

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
      setStatusMsg({ type: 'error', text: 'Failed to sync with Material Master.' });
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
    <Box sx={{ display: 'flex', bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="900" mb={4} color="#1e293b">Production Floor</Typography>

        {statusMsg.text && <Alert severity={statusMsg.type} sx={{ mb: 3, borderRadius: '12px' }}>{statusMsg.text}</Alert>}

        <Grid container spacing={3}>
          {/* LEFT: AUTHORIZATION FORM */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldCheck size={20} color="#1a237e" />
                <Typography variant="subtitle1" fontWeight="900">Authorize Batch Start</Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <TextField fullWidth label="Batch Number" value={form.batch_number} onChange={e => setForm({...form, batch_number: e.target.value})} sx={{ mb: 3 }} />
                
                <Typography variant="caption" color="primary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>SEARCH & SELECT RAW MATERIAL</Typography>
                <Autocomplete
                  options={materials}
                  getOptionLabel={(option) => `${option.material_name} (${option.quantity_kg} kg available)`}
                  onChange={(e, val) => setForm({...form, raw_material_name: val?.material_name || ''})}
                  renderInput={(params) => (
                    <TextField {...params} label="Tap to search material..." variant="outlined" 
                      sx={{ '& .MuiOutlinedInput-root': { height: '56px', borderRadius: '10px', bgcolor: '#f0f4ff' } }} 
                    />
                  )}
                />

                <Typography variant="caption" color="textSecondary" mt={3} display="block" fontWeight="bold">MCC PROCESS STAGE</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3, mt: 1 }}>
                  {stages.map(s => (
                    <Chip key={s} label={s} onClick={() => setForm({...form, phase: s})} color={form.phase === s ? 'primary' : 'default'} sx={{ fontWeight: 'bold', borderRadius: '8px' }} />
                  ))}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField fullWidth type="number" label="Quantity (kg)" value={form.quantity_to_use} onChange={e => setForm({...form, quantity_to_use: e.target.value})} /></Grid>
                  <Grid item xs={6}>
                    <TextField select fullWidth label="Shift" value={form.shift} onChange={e => setForm({...form, shift: e.target.value})}>
                      <MenuItem value="Shift A">Shift A</MenuItem><MenuItem value="Shift B">Shift B</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Button fullWidth variant="contained" sx={{ mt: 4, height: 55, borderRadius: '12px', fontWeight: '900', bgcolor: '#1a237e' }} startIcon={<Play />} onClick={handleStartProduction}>START PRODUCTION</Button>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT: LIVE MONITOR */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
              <Box sx={{ p: 2, bgcolor: '#1a237e', color: 'white' }}><Typography fontWeight="900" display="flex" alignItems="center" gap={1}><Clock size={18} /> Live Production Monitor</Typography></Box>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900 }}>Batch</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>Stage</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell sx={{ fontWeight: 800, color: '#1a237e' }}>{batch.batch_number}</TableCell>
                        <TableCell><Chip label={batch.phase} size="small" variant="outlined" /></TableCell>
                        <TableCell align="right">
                          <Button variant="contained" color="error" size="small" startIcon={<CheckCircle size={14}/>}>End</Button>
                        </TableCell>
                      </TableRow>
                    ))}
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