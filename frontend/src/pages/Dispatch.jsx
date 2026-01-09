import React, { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, Divider 
} from '@mui/material';
import { Send, Download, FileText, PackageCheck, History } from 'lucide-react';
// MUST IMPORT THESE
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

function Dispatch() {
  const [stagedItems, setStagedItems] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/inventory/finished-goods');
      // Only items ready for final truck loading
      setStagedItems(res.data.filter(i => i.status === "In Dispatch Area"));
      
      const historyRes = await api.get('/inventory/dispatch-history'); 
      setHistoryItems(historyRes.data);
    } catch (err) { console.error("Fetch failed", err); }
  };
  const downloadInvoice = (item) => {
  console.log("Generating PDF for batch:", item.batch_no);
  try {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(26, 35, 126); 
    doc.text("MCC PDMS - DISPATCH INVOICE", 105, 20, { align: "center" });

    // USE autoTable(doc, options) instead of doc.autoTable(options)
    autoTable(doc, {
      startY: 35,
      head: [['Field', 'Details']],
      body: [
        ["Product", "Microcrystalline Cellulose (MCC)"],
        ["Batch Number", item.batch_no],
        ["Quantity", `${item.quantity_kg} kg`],
        ["Origin Location", item.storage_location || "Warehouse A"],
        ["Status", "OFFICIALLY DISPATCHED"],
        ["Timestamp", item.dispatched_at || new Date().toLocaleString()]
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 126] }
    });

    doc.save(`Invoice_${item.batch_no}.pdf`);
  } catch (error) {
    console.error("PDF Error:", error);
    alert("PDF generation failed. Check browser console.");
  }
};
  

  const handleFinalDispatch = async (batchNo) => {
    if (window.confirm(`Confirm Batch ${batchNo} has left the plant?`)) {
      try {
        await api.post(`/inventory/final-dispatch/${batchNo}`);
        alert("Batch successfully dispatched!");
        fetchData(); 
      } catch (err) { alert("Dispatch failed."); }
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f7fe', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="900" color="#1e293b" mb={4} display="flex" gap={2} alignItems="center">
          <PackageCheck size={32} color="#1a237e" /> Dispatch Monitoring
        </Typography>

        {/* ACTIVE STAGING AREA */}
        <Typography variant="h6" fontWeight="700" mb={2}>Staging Bay (Ready to Ship)</Typography>
        <Paper sx={{ borderRadius: '16px', mb: 6, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>Batch Number</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Quantity</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 900 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stagedItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 800 }}>{item.batch_no}</TableCell>
                    <TableCell>{item.quantity_kg} kg</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button variant="contained" size="small" onClick={() => handleFinalDispatch(item.batch_no)}>Dispatch</Button>
                        {/* PASS ITEM OBJECT HERE */}
                        <Button variant="outlined" size="small" color="secondary" onClick={() => downloadInvoice(item)}>Invoice</Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Divider sx={{ mb: 4 }} />

        {/* HISTORY SECTION */}
        <Typography variant="h6" fontWeight="700" mb={2} display="flex" gap={1} alignItems="center">
          <History size={20} /> Dispatch History (Outbound)
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900 }}>Batch ID</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Dispatch Time</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ fontWeight: 700 }}>{item.batch_no}</TableCell>
                  <TableCell>{item.dispatched_at ? new Date(item.dispatched_at).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<Download size={14}/>} onClick={() => downloadInvoice(item)}>Invoice</Button>
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

export default Dispatch;