import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, Typography, TextField, Button, Card, CardContent, Grid, 
  Chip, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Slider 
} from '@mui/material';
import { Beaker, CheckCircle, Clock } from 'lucide-react';

function QC() {
  const [pendingBatches, setPendingBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [results, setResults] = useState({ moisture: 3.5, purity: 98.5, particle_size: 150 });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/qc/pending-approval'); 
      setPendingBatches(res.data);
    } catch (err) { console.error("Fetch failed", err); }
  };

  const handleApprove = async () => {
    if (!selectedBatch) return alert("Select a batch from the queue first.");
    try {
      await api.post(`/qc/approve-batch/${selectedBatch.id}`, results);
      setStatusMsg({ type: 'success', text: `Batch ${selectedBatch.batch_number} Approved and moved to Inventory!` });
      setSelectedBatch(null);
      fetchPending();
    } catch (err) { setStatusMsg({ type: 'error', text: 'Approval failed.' }); }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f7fe', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="900" mb={4} color="#4a148c" display="flex" alignItems="center" gap={2}>
          <Beaker size={32} /> QC Lab & Compliance
        </Typography>

        {statusMsg.text && <Alert severity={statusMsg.type} sx={{ mb: 3 }}>{statusMsg.text}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <Box sx={{ p: 2, bgcolor: '#f3e5f5' }}>
                <Typography fontWeight="900" color="#4a148c" display="flex" alignItems="center" gap={1}>
                  <Clock size={18} /> Production Output: Awaiting Lab Analysis
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900 }}>Batch ID</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingBatches.map((b) => (
                      <TableRow key={b.id} selected={selectedBatch?.id === b.id}>
                        <TableCell sx={{ fontWeight: 700 }}>{b.batch_number}</TableCell>
                        <TableCell align="right">
                          <Button variant="contained" size="small" onClick={() => setSelectedBatch(b)}>Analyze</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <Box sx={{ p: 2, bgcolor: '#4a148c', color: 'white' }}>
                <Typography fontWeight="900">Lab Results: {selectedBatch?.batch_number || "Select Batch"}</Typography>
              </Box>
              <CardContent>
                <Typography variant="caption" fontWeight="bold">MOISTURE CONTENT (%)</Typography>
                <Slider value={results.moisture} step={0.1} min={0} max={10} valueLabelDisplay="auto" 
                  onChange={(e, val) => setResults({...results, moisture: val})} sx={{ color: '#4a148c' }} />
                
                <Typography variant="caption" fontWeight="bold" sx={{ mt: 2, display: 'block' }}>PURITY LEVEL (%)</Typography>
                <Slider value={results.purity} step={0.1} min={90} max={100} valueLabelDisplay="auto" 
                  onChange={(e, val) => setResults({...results, purity: val})} sx={{ color: '#4a148c' }} />

                <Typography variant="caption" fontWeight="bold" sx={{ mt: 2, display: 'block' }}>PARTICLE SIZE (μm)</Typography>
                <TextField fullWidth size="small" type="number" value={results.particle_size}
                  onChange={(e) => setResults({...results, particle_size: e.target.value})} sx={{ mt: 1 }} />

                <Button fullWidth variant="contained" startIcon={<CheckCircle />} onClick={handleApprove}
                  sx={{ mt: 4, bgcolor: '#4a148c', height: 50, fontWeight: 900 }}>
                  Approve for Dispatch
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default QC;