import { Link } from 'react-router-dom';
import { Button, Container, Typography, Box, Grid, Paper } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PublicIcon from '@mui/icons-material/Public';

const HomePage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box textAlign="center" mb={5}>
        <MedicalServicesIcon color="primary" sx={{ fontSize: 60, mb: 1 }} />
        <Typography variant="h2" fontWeight={700} color="primary.main" gutterBottom>
          MedBlock Kenya
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Secure, Modern Healthcare Management for Kenya
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Blockchain-powered, AI-ready, and fully monetizable. Manage medical records, appointments, vital signs, insurance, and more—all with local compliance and M-Pesa integration.
        </Typography>
        <Button component={Link} to="/login" variant="contained" color="primary" size="large" sx={{ mr: 2 }}>
          Login
        </Button>
        <Button component={Link} to="/register" variant="outlined" color="primary" size="large">
          Register
        </Button>
      </Box>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <MonetizationOnIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Monetization</Typography>
            <Typography variant="body2">Subscriptions, micro-insurance, claims, and M-Pesa payments for sustainable healthcare.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <PublicIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Kenyan Context</Typography>
            <Typography variant="body2">Local validation, compliance, and health education resources tailored for Kenya.</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ mt: 6, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="caption">
          &copy; {new Date().getFullYear()} MedBlock Kenya. Powered by React, MUI, and Blockchain.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage; 