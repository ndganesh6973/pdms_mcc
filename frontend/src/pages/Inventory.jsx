import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Grid, Button, Tooltip 
} from '@mui/material';
import { Boxes, MapPin, Scale, Send, History, Truck } from 'lucide-react';

function Inventory() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total_kg: 0, batch_count: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Returns items that are "In Stock" or "In Dispatch Area"
      const res = await api.get('/inventory/finished-goods');
      const sumRes = await api.get('/inventory/summary');
      setItems(res.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error("Inventory fetch failed", err);
    }
  };

  // UPDATED: Now moves item to Dispatch Area instead of final dispatch
  const handleMoveToStaging = async (batchNo) => {
    if (window.confirm(`Move Batch ${batchNo} to the Dispatch Staging Area?`)) {
      try {
        // Step 1: Internal movement
        await api.post(`/inventory/move-to-dispatch/${batchNo}`);
        fetchData(); // Refresh list to show updated status
      } catch (err) {
        alert("Movement to staging failed");
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f7fe', minHeight: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="900" color="#1e293b" mb={4} display="flex" alignItems="center" gap={2}>
          <Boxes size={32} color="#1a237e" /> Finished Goods Inventory
        </Typography>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', borderLeft: '8px solid #1a237e', bgcolor: 'white' }}>
              <Typography color="textSecondary" variant="caption" fontWeight="900">WAREHOUSE STOCK ON HAND</Typography>
              <Typography variant="h3" fontWeight="900" color="#1e293b">{summary.total_kg.toLocaleString()} kg</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', borderLeft: '8px solid #43a047', bgcolor: 'white' }}>
              <Typography color="textSecondary" variant="caption" fontWeight="900">TOTAL READY BATCHES</Typography>
              <Typography variant="h3" fontWeight="900" color="#1e293b">{summary.batch_count}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900 }}>Batch Number</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Stored Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 800, color: '#1a237e' }}>{item.batch_no}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{item.product_name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <Scale size={16} color="#64748b" /> {item.quantity_kg} kg
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={<MapPin size={14} />} 
                      label={item.storage_location || 'Warehouse A'} 
                      variant="outlined" 
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={item.status} 
                      color={item.status === "In Stock" ? "success" : "secondary"} 
                      size="small" 
                      sx={{ fontWeight: 900 }} 
                    />
                  </TableCell>
                  <TableCell align="center">
                    {item.status === "In Stock" ? (
                      <Tooltip title="Move to Dispatch Area">
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={() => handleMoveToStaging(item.batch_no)}
                          sx={{ bgcolor: '#1a237e', minWidth: '40px' }}
                        >
                          <Send size={16} />
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Already in Dispatch Area">
                        <span>
                          <Button variant="outlined" size="small" disabled sx={{ minWidth: '40px' }}>
                            <Truck size={16} />
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748b' }}>
                    <History size={48} style={{ opacity: 0.2, marginBottom: 10 }} />
                    <Typography variant="body1">Warehouse is currently empty.</Typography>
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

export default Inventory;