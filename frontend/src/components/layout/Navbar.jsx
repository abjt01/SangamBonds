import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Menu, AccountCircle, Logout } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          SangamBonds
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">
            Welcome, {user?.name || 'User'}
          </Typography>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
          <IconButton color="inherit" onClick={logout}>
            <Logout />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
