import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  AccountBalance,
  Person,
  Analytics,
  Settings,
  Help
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Bond Market', icon: <TrendingUp />, path: '/market' },
    { text: 'Portfolio', icon: <AccountBalance />, path: '/portfolio' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 960) {
      onClose();
    }
  };

  const isActive = (path) => location.pathname === path;

  const drawer = (
    <Box sx={{ overflow: 'auto', height: '100%', bgcolor: '#ffffff' }}>
      {/* User Profile Section */}
      <Box sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: 'primary.main',
              color: '#ffffff',
              fontWeight: 700
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6" sx={{ color: '#000000 !important', fontWeight: 700 }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#374151 !important' }}>
              {user?.email || 'user@example.com'}
            </Typography>
            <Box mt={1}>
              <Chip 
                label={user?.kycStatus || 'Verified'} 
                size="small" 
                color="success" 
                variant="filled"
                sx={{ fontSize: '10px', fontWeight: 600 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Balance Section */}
      <Box sx={{ p: 3, bgcolor: '#eff6ff', borderBottom: '1px solid #e5e7eb' }}>
        <Typography variant="body2" sx={{ color: '#374151 !important', fontWeight: 500 }}>
          Available Balance
        </Typography>
        <Typography variant="h6" sx={{ color: '#000000 !important', fontWeight: 700 }}>
          ₹{(user?.wallet?.balance || 50000).toLocaleString()}
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ pt: 0 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                py: 2,
                px: 3,
                bgcolor: isActive(item.path) ? '#dbeafe' : 'transparent',
                borderRight: isActive(item.path) ? '4px solid #3b82f6' : 'none',
                '&:hover': {
                  bgcolor: '#f3f4f6',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive(item.path) ? '#3b82f6' : '#374151',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  sx: { 
                    color: isActive(item.path) ? '#3b82f6 !important' : '#000000 !important',
                    fontWeight: isActive(item.path) ? 700 : 500,
                    fontSize: '14px'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Additional Menu Items */}
      <List>
        <ListItem disablePadding>
          <ListItemButton sx={{ py: 2, px: 3 }}>
            <ListItemIcon sx={{ color: '#374151', minWidth: 40 }}>
              <Analytics />
            </ListItemIcon>
            <ListItemText 
              primary="Analytics"
              primaryTypographyProps={{
                sx: { 
                  color: '#000000 !important',
                  fontWeight: 500,
                  fontSize: '14px'
                }
              }}
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton sx={{ py: 2, px: 3 }}>
            <ListItemIcon sx={{ color: '#374151', minWidth: 40 }}>
              <Settings />
            </ListItemIcon>
            <ListItemText 
              primary="Settings"
              primaryTypographyProps={{
                sx: { 
                  color: '#000000 !important',
                  fontWeight: 500,
                  fontSize: '14px'
                }
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton sx={{ py: 2, px: 3 }}>
            <ListItemIcon sx={{ color: '#374151', minWidth: 40 }}>
              <Help />
            </ListItemIcon>
            <ListItemText 
              primary="Help & Support"
              primaryTypographyProps={{
                sx: { 
                  color: '#000000 !important',
                  fontWeight: 500,
                  fontSize: '14px'
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        p: 2, 
        bgcolor: '#f8fafc',
        borderTop: '1px solid #e5e7eb'
      }}>
        <Typography variant="caption" sx={{ color: '#374151 !important', textAlign: 'center', display: 'block' }}>
          SangamBonds v2.0
        </Typography>
        <Typography variant="caption" sx={{ color: '#374151 !important', textAlign: 'center', display: 'block' }}>
          © 2025 All rights reserved
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            bgcolor: '#ffffff',
            boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)'
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: open ? drawerWidth : 60,
            transition: 'width 0.3s ease',
            bgcolor: '#ffffff',
            boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
            overflowX: 'hidden'
          },
        }}
        open
      >
        {open && drawer}
        {!open && (
          <Box sx={{ overflow: 'auto', height: '100%', bgcolor: '#ffffff', pt: 10 }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      py: 2,
                      px: 2,
                      justifyContent: 'center',
                      bgcolor: isActive(item.path) ? '#dbeafe' : 'transparent',
                      borderRight: isActive(item.path) ? '4px solid #3b82f6' : 'none',
                      '&:hover': {
                        bgcolor: '#f3f4f6',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: isActive(item.path) ? '#3b82f6' : '#374151',
                      minWidth: 'auto',
                      justifyContent: 'center'
                    }}>
                      {item.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
