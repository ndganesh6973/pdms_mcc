import React, { useState } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { Box, Typography, Grid, Card, CardContent, TextField, Button, Alert, LinearProgress, Divider } from '@mui/material';
import { Brain, Activity, Zap, ShieldAlert } from 'lucide-react';

function Intelligence() {
  const [formData, setFormData] = useState({
    drying_time: 45,
    milling_speed: 1500,
    acid_ph: 2.5
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    setLoading(true);
    setError('');
    
    // SYNC: Cast to Number to satisfy the 'float' requirement in schemas.py
    const payload = {
      drying_time: Number(formData.drying_time),
      milling_speed: Number(formData.milling_speed),
      acid_ph: Number(formData.acid_ph)
    };

    try {
      const res = await api.post('/ml/predict-quality', payload);
      setPrediction(res.data);
    } catch (err) {
      // Capture detailed validation errors
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? `Field Error: ${detail[0].loc[1]} - ${detail[0].msg}` : 'AI Engine Offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f7fe', minHeight: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="900" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Brain size={32} color="#7b1fa2" /> Predictive Quality (AI Engine)
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Box sx={{ bgcolor: '#7b1fa2', p: 1 }} />
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom><Activity size={20}/> Sensor Data Inputs</Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="DRYING TIME (MIN)" type="number" value={formData.drying_time} 
                      onChange={(e) => setFormData({...formData, drying_time: e.target.value})} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="MILLING SPEED (RPM)" type="number" value={formData.milling_speed} 
                      onChange={(e) => setFormData({...formData, milling_speed: e.target.value})} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="ACID PH LEVEL" type="number" value={formData.acid_ph} 
                      onChange={(e) => setFormData({...formData, acid_ph: e.target.value})} />
                  </Grid>
                </Grid>
                <Button fullWidth variant="contained" size="large" onClick={handlePredict} disabled={loading} 
                  startIcon={<Zap />} sx={{ mt: 4, height: 56, borderRadius: '12px', bgcolor: '#7b1fa2', fontWeight: 'bold' }}>
                  {loading ? 'Analyzing...' : 'Run Intelligence Check'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            {error && <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>{error}</Alert>}
            {prediction && (
              <Card sx={{ p: 4, borderRadius: '16px', textAlign: 'center', borderTop: `8px solid ${prediction.status === 'PASS' ? '#2e7d32' : '#d32f2f'}` }}>
                <Typography variant="h6" color="text.secondary" fontWeight="bold">Predicted Purity Score</Typography>
                <Typography variant="h1" fontWeight="900" color={prediction.quality_score > 90 ? 'success.main' : 'error.main'}>
                  {prediction.quality_score}%
                </Typography>
                <LinearProgress variant="determinate" value={prediction.quality_score} color={prediction.quality_score > 90 ? "success" : "error"} sx={{ height: 12, borderRadius: 5, my: 3 }} />
                <Alert icon={<ShieldAlert />} severity={prediction.status === 'PASS' ? "success" : "warning"} sx={{ borderRadius: '12px', fontWeight: 'bold' }}>
                  Status: {prediction.status} — {prediction.recommendation}
                </Alert>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Intelligence;