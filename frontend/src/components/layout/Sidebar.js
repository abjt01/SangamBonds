import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
  Collapse,
  Badge,
} from '@mui/material';
import {
  Dashboard,
  ShowChart,
  AccountBalanceWallet,
  Leaderboard,
  Person,
  Settings,
  TrendingUp,
  Assessment,
  BookmarkBorder,
  Notifications,
  Help,
  ExpandLess,
  ExpandMore,
  CandlestickChart,
  DonutLarge,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const drawerWidth = 280;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
  },
}));

const SidebarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  paddingTop: theme.spacing(2),
}));

const MenuSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  fontSize: '12px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  margin: theme.spacing(0, 1),
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  ...(active && {
    backgroundColor: '#f3f4f6',
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  }),
  '&:hover': {
    backgroundColor: '#f9fafb',
  },
}));

const WalletCard = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: '#f8fafc',
  borderRadius: theme.spacing(1.5),
  border: '1px solid #e2e8f0',
}));

const menuItems = [
  {
    section: 'Main',
    items: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { text: 'Bond Market', icon: <ShowChart />, path: '/market' },
      { text: 'Trading', icon: <CandlestickChart />, path: '/trading' },
    ]
  },
  {
    section: 'Portfolio',
    items: [
      { text: 'My Portfolio', icon: <AccountBalanceWallet />, path: '/portfolio' },
      { text: 'Watchlist', icon: <BookmarkBorder />, path: '/watchlist', badge: 5 },
      { text: 'Analytics', icon: <Assessment />, path: '/analytics' },
    ]
  },
  {
    section: 'Social',
    items: [
      { text: 'Leaderboard', icon: <Leaderboard />, path: '/leaderboard' },
      { text: 'Achievements', icon: <DonutLarge />, path: '/achievements', badge: 2 },
    ]
  },
  {
    section: 'Account',
    items: [
      { text: 'Profile', icon: <Person />, path: '/profile' },
      { text: 'Notifications', icon: <Notifications />, path: '/notifications', badge: 3 },
      { text: 'Settings', icon: <Settings />, path: '/settings' },
      { text: 'Help & Support', icon: <Help />, path: '/help' },
    ]
  },
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});

  // Mock user data
  const userData = {
    wallet: 50000,
    totalValue: 78125, // wallet + investments
    todayPnL: 1250,
    todayPnLPercent: 1.62
  };

  const handleItemClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString()}`;

  return (
    <StyledDrawer
      variant="persistent"
      anchor="left"
      open={open}
    >
      <Toolbar />
      <SidebarContainer>
        {/* Wallet Summary */}
        <WalletCard>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Portfolio Value
          </Typography>
          <Typography variant="h6" fontWeight="700" gutterBottom>
            {formatCurrency(userData.totalValue)}
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Available: {formatCurrency(userData.wallet)}
            </Typography>
            <Box display="flex" alignItems="center">
              <TrendingUp sx={{ fontSize: 16, color: '#22c55e', mr: 0.5 }} />
              <Typography variant="body2" color="#22c55e" fontWeight="600">
                +{formatCurrency(userData.todayPnL)}
              </Typography>
            </Box>
          </Box>
        </WalletCard>

        {/* Navigation Menu */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {menuItems.map((section, sectionIndex) => (
            <MenuSection key={section.section}>
              <SectionTitle variant="overline">
                {section.section}
              </SectionTitle>
              <List disablePadding>
                {section.items.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <StyledListItemButton
                      active={location.pathname === item.path}
                      onClick={() => handleItemClick(item.path)}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.badge ? (
                          <Badge badgeContent={item.badge} color="error" variant="dot">
                            {item.icon}
                          </Badge>
                        ) : (
                          item.icon
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: location.pathname === item.path ? 600 : 500,
                        }}
                      />
                      {item.badge && !item.badge.hidden && (
                        <Badge badgeContent={item.badge} color="primary" size="small" />
                      )}
                    </StyledListItemButton>
                  </ListItem>
                ))}
              </List>
              {sectionIndex < menuItems.length - 1 && <Divider sx={{ my: 1, mx: 2 }} />}
            </MenuSection>
          ))}
        </Box>

        {/* Quick Actions */}
        <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" gap={1} mt={1}>
            <Box
              sx={{
                flex: 1,
                p: 1.5,
                backgroundColor: '#dcfce7',
                borderRadius: 1,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#bbf7d0' }
              }}
              onClick={() => navigate('/trading')}
            >
              <TrendingUp sx={{ fontSize: 20, color: '#22c55e' }} />
              <Typography variant="caption" display="block" color="#15803d">
                Buy
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 1.5,
                backgroundColor: '#fee2e2',
                borderRadius: 1,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#fecaca' }
              }}
              onClick={() => navigate('/trading')}
            >
              <Assessment sx={{ fontSize: 20, color: '#ef4444' }} />
              <Typography variant="caption" display="block" color="#dc2626">
                Sell
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Version Info */}
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            SangamBonds v1.0.0
          </Typography>
        </Box>
      </SidebarContainer>
    </StyledDrawer>
  );
};

export default Sidebar;