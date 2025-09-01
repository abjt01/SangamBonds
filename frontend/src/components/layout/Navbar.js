import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Settings,
  Logout,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#ffffff',
  color: '#1f2937',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderBottom: '1px solid #e5e7eb',
  zIndex: theme.zIndex.drawer + 1,
}));

const MarketTicker = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginLeft: theme.spacing(3),
  overflow: 'hidden',
}));

const TickerItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  whiteSpace: 'nowrap',
  minWidth: 'fit-content',
}));

const UserSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const Navbar = ({ onMenuClick }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [marketData, setMarketData] = useState([
    { symbol: 'TATA001', name: 'Tata Motors', price: 1070.29, change: 12.45, changePercent: 1.18 },
    { symbol: 'HDFC001', name: 'HDFC Bank', price: 1025.50, change: -5.30, changePercent: -0.51 },
    { symbol: 'REL001', name: 'Reliance', price: 1080.75, change: 8.25, changePercent: 0.77 },
  ]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const formatPrice = (price) => `₹${price.toFixed(2)}`;
  const formatChange = (change, percent) => {
    const isPositive = change >= 0;
    return {
      value: `${isPositive ? '+' : ''}${change.toFixed(2)} (${isPositive ? '+' : ''}${percent.toFixed(2)}%)`,
      color: isPositive ? '#22c55e' : '#ef4444',
      icon: isPositive ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />
    };
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <StyledAppBar position="fixed">
      <Toolbar>
        {/* Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          SangamBonds
        </Typography>

        {/* Market Ticker */}
        <MarketTicker>
          {marketData.map((item, index) => {
            const changeData = formatChange(item.change, item.changePercent);
            return (
              <TickerItem key={item.symbol}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.symbol}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {formatPrice(item.price)}
                </Typography>
                <Box display="flex" alignItems="center" sx={{ color: changeData.color }}>
                  {changeData.icon}
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', ml: 0.5 }}>
                    {changeData.value}
                  </Typography>
                </Box>
                {index < marketData.length - 1 && (
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                )}
              </TickerItem>
            );
          })}
        </MarketTicker>

        <Box sx={{ flexGrow: 1 }} />

        {/* User Section */}
        <UserSection>
          {/* Market Status */}
          <Chip
            icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />}
            label="Market Open"
            size="small"
            variant="outlined"
            sx={{ borderColor: '#22c55e', color: '#22c55e' }}
          />

          {/* Wallet Balance */}
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary">
              Wallet
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              ₹{user?.wallet?.toLocaleString() || '50,000'}
            </Typography>
          </Box>

          {/* Notifications */}
          <IconButton size="large" color="inherit">
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Profile */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar
              sx={{ width: 32, height: 32 }}
              src={user?.profileImage}
              alt={user?.name}
            >
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
        </UserSection>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          id="primary-search-account-menu"
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 240,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
              },
            },
          }}
        >
          {/* User Info */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.name || 'Demo User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'demo@sangambonds.com'}
            </Typography>
            <Box mt={1}>
              <Chip 
                label={user?.tradingLevel || 'Beginner'} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {user?.points || 150} points
              </Typography>
            </Box>
          </Box>

          <MenuItem onClick={handleMenuClose}>
            <AccountCircle sx={{ mr: 2 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Settings sx={{ mr: 2 }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;