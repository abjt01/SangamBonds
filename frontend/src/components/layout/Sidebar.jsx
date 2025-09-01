import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { Dashboard, TrendingUp, AccountBalance, Person, AccountBalanceWallet } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Market', icon: <TrendingUp />, path: '/market' },
  { text: 'Trading', icon: <AccountBalance />, path: '/trading' },
  { text: 'Portfolio', icon: <AccountBalanceWallet />, path: '/portfolio' }, // Changed icon
  { text: 'Profile', icon: <Person />, path: '/profile' },
];

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                cursor: 'pointer',
                backgroundColor: location.pathname === item.path ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
