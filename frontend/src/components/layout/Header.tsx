import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../features/auth/authSlice';
import type { AppDispatch } from '../../app/store';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const Header = () => {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" color="primary" sx={{ flexGrow: 1, fontWeight: 700 }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#1976d2' }}>MedBlock</Link>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="primary" component={Link} to="/">Home</Button>
          {user ? (
            <>
              <Button color="primary" component={Link} to="/dashboard">Dashboard</Button>
              <Typography variant="body2" color="text.secondary" sx={{ mx: 2, alignSelf: 'center' }}>
                {user.name || user.fullName || user.email}
              </Typography>
              <Button color="primary" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="primary" component={Link} to="/login">Login</Button>
              <Button color="primary" component={Link} to="/register">Register</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 