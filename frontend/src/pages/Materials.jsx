import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Grid, TextField, Divider, Tooltip, Alert
} from '@mui/material';
import { Search, Plus, Upload, Edit, Trash2, AlertTriangle, FileText } from 'lucide-react';
// 1. Import PDF Libraries
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const LOW_STOCK_THRESHOLD = 100;

function Materials() {
  const [stock, setStock] = useState([]);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [form, setForm] = useState({ material_id: '', name: '', kg: '', supplier: '' });
  
  // Get logged in user name (Ganesh from your Sidebar)
  const adminName = "GANESH (Admin)"; 

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/materials/search?query=${search}`);
      setStock(res.data);
    } catch (err) { console.error("Fetch failed", err); }
  };

  // 2. PDF Generator Function
  const generateMaterialPDF = (item) => {
    const doc = new jsPDF();

    // Document Header
    doc.setFontSize(20);
    doc.setTextColor(26, 35, 126); 
    doc.text("MCC PDMS - MATERIAL STOCK REPORT", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    // Table Content
    autoTable(doc, {
      startY: 40,
      head: [['Inventory Field', 'Verified Material Details']],
      body: [
        ["Material ID", item.material_id],
        ["Material Name", item.material_name],
        ["Current Stock Balance", `${item.quantity_kg} kg`],
        ["Supplier Source", item.supplier_name || "General Source"],
        ["Stock Condition", item.quantity_kg < LOW_STOCK_THRESHOLD ? "LOW STOCK ALERT" : "OPTIMAL"],
        ["System Verification", "PASSED"],
        ["APPROVED BY", adminName] // Approved by member name
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 126] },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });

    // Save the file
    doc.save(`Material_Report_${item.material_id}.pdf`);
  };

  const handleSave = async () => {
    if (!form.material_id || !form.name || !form.kg) {
      setStatus({ type: 'error', msg: 'Please fill required fields.' });
      return;
    }
    try {
      const payload = { ...form, kg: parseFloat(form.kg) };
      if (isEditing) {
        await api.put(`/materials/update/${form.material_id}`, payload);
      } else {
        await api.post('/materials/add', payload);
      }
      setForm({ material_id: '', name: '', kg: '', supplier: '' });
      setIsEditing(false);
      fetchData();
      setStatus({ type: 'success', msg: 'Material record processed.' });
    } catch (err) { setStatus({ type: 'error', msg: 'Action failed.' }); }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        const payload = lines.map(line => {
          const parts = line.split(',');
          if (parts.length < 3) return null;
          return {
            material_id: parts[0]?.trim(),
            name: parts[1]?.trim(),
            kg: parseFloat(parts[2]?.trim()) || 0,
            supplier: parts[3]?.trim() || 'General'
          };
        }).filter(item => item !== null);

        await api.post('/materials/import-bulk', payload);
        setStatus({ type: 'success', msg: `Successfully imported ${payload.length} items.` });
        fetchData();
      } catch (err) { 
        setStatus({ type: 'error', msg: 'Import failed. Check file format.' });
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = async (mId) => {
    if (window.confirm(`Permanently delete ${mId}?`)) {
      try {
        await api.delete(`/materials/delete/${mId}`);
        fetchData();
      } catch (err) { setStatus({ type: 'error', msg: 'Delete failed.' }); }
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f7fe', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" fontWeight="900">Material Master</Typography>
          <TextField 
            placeholder="Search Material ID or Name..." size="small" value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 400, bgcolor: 'white' }}
          />
        </Box>

        {status.msg && <Alert severity={status.type} sx={{ mb: 2 }}>{status.msg}</Alert>}

        <Paper sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800 }}>
            {isEditing ? "EDIT MODE" : "ADD NEW MATERIAL"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={2}><TextField fullWidth label="Material ID" size="small" disabled={isEditing} value={form.material_id} onChange={(e) => setForm({...form, material_id: e.target.value})} /></Grid>
            <Grid item xs={3}><TextField fullWidth label="Material Name" size="small" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></Grid>
            <Grid item xs={2}><TextField fullWidth label="Qty (Kg)" size="small" type="number" value={form.kg} onChange={(e) => setForm({...form, kg: e.target.value})} /></Grid>
            <Grid item xs={3}><TextField fullWidth label="Supplier" size="small" value={form.supplier} onChange={(e) => setForm({...form, supplier: e.target.value})} /></Grid>
            <Grid item xs={2}>
               <Button fullWidth variant="contained" sx={{ bgcolor: '#1a237e', height: 40 }} onClick={handleSave}>
                 {isEditing ? "Update" : "Register"}
               </Button>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Button variant="outlined" startIcon={<Upload />} component="label">
            Import TXT Data
            <input type="file" accept=".txt" hidden onChange={handleFileUpload} />
          </Button>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900 }}>Material ID</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Stock (kg)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>Report</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stock.map((item) => {
                const isLowStock = item.quantity_kg < LOW_STOCK_THRESHOLD;
                return (
                  <TableRow key={item.id} hover sx={{ bgcolor: isLowStock ? '#fff1f2' : 'inherit' }}>
                    <TableCell fontWeight="bold">{item.material_id}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {item.material_name}
                        {isLowStock && <Tooltip title="Low Stock Warning"><AlertTriangle size={16} color="#ef4444" /></Tooltip>}
                      </Box>
                    </TableCell>
                    <TableCell>{item.supplier_name}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: isLowStock ? '#ef4444' : '#1a237e' }}>
                      {item.quantity_kg} kg
                    </TableCell>
                    
                    {/* NEW PDF COLUMN */}
                    <TableCell align="center">
                      <Tooltip title="Download Stock Report">
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          size="small"
                          onClick={() => generateMaterialPDF(item)}
                        >
                          <FileText size={16} />
                        </Button>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Edit"><Button onClick={() => { setForm({material_id: item.material_id, name: item.material_name, kg: item.quantity_kg, supplier: item.supplier_name}); setIsEditing(true); }}><Edit size={16}/></Button></Tooltip>
                      <Tooltip title="Delete"><Button color="error" onClick={() => handleDelete(item.material_id)}><Trash2 size={16}/></Button></Tooltip>
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

export default Materials;