import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  Settings,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: '#ffffff !important',
            fontWeight: 700,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          SangamBonds
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationClick}
            sx={{ color: '#ffffff' }}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Welcome Message */}
          <Typography 
            variant="body1" 
            sx={{ 
              mr: 2, 
              display: { xs: 'none', md: 'block' },
              color: '#ffffff !important',
              fontWeight: 600,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
          >
            Welcome back, {user?.name || 'User'}!
          </Typography>

          {/* Profile Avatar */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 600
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ color: '#000000 !important', fontWeight: 600 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#374151 !important' }}>
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <AccountCircle sx={{ mr: 2, color: '#374151' }} />
            <Typography sx={{ color: '#000000 !important', fontWeight: 500 }}>
              Profile
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Settings sx={{ mr: 2, color: '#374151' }} />
            <Typography sx={{ color: '#000000 !important', fontWeight: 500 }}>
              Settings
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 2, color: '#dc2626' }} />
            <Typography sx={{ color: '#dc2626 !important', fontWeight: 500 }}>
              Logout
            </Typography>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 300,
              maxHeight: 400,
            },
          }}
        >
          <MenuItem onClick={handleNotificationClose}>
            <Box>
              <Typography variant="body2" sx={{ color: '#000000 !important', fontWeight: 600 }}>
                Order Executed
              </Typography>
              <Typography variant="caption" sx={{ color: '#374151 !important' }}>
                Your buy order for HDFC001 has been executed
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Box>
              <Typography variant="body2" sx={{ color: '#000000 !important', fontWeight: 600 }}>
                Price Alert
              </Typography>
              <Typography variant="caption" sx={{ color: '#374151 !important' }}>
                TATA001 price dropped to ₹1070
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Box>
              <Typography variant="body2" sx={{ color: '#000000 !important', fontWeight: 600 }}>
                Market Update
              </Typography>
              <Typography variant="caption" sx={{ color: '#374151 !important' }}>
                Bond market closed with positive sentiment
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
