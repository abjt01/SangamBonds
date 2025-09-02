import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  IconButton,
  Avatar,
  Paper
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { TrendingUp, TrendingDown, Refresh, Visibility } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Portfolio = () => {
  const { user, portfolio } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Calculate portfolio summary
  const portfolioSummary = React.useMemo(() => {
    let totalInvested = 0;
    let totalCurrentValue = 0;

    portfolio.forEach(holding => {
      totalInvested += holding.totalInvested;
      // Simulate some price changes for current value
      const priceChange = (Math.random() - 0.5) * 0.1; // ±5% change
      const currentPrice = holding.avgPrice * (1 + priceChange);
      totalCurrentValue += holding.quantity * currentPrice;
    });

    const totalPnL = totalCurrentValue - totalInvested;
    const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    return {
      totalInvested: Math.round(totalInvested),
      totalMarketValue: Math.round(totalCurrentValue),
      totalPnL: Math.round(totalPnL),
      totalPnLPercentage: Math.round(totalPnLPercentage * 100) / 100,
      totalHoldings: portfolio.length,
      cashBalance: user?.wallet?.balance || 0
    };
  }, [portfolio, user?.wallet?.balance]);

  // Calculate holdings with current prices
  const enrichedHoldings = React.useMemo(() => {
    return portfolio.map(holding => {
      // Simulate price changes
      const priceChange = (Math.random() - 0.5) * 0.1; // ±5% change
      const currentPrice = holding.avgPrice * (1 + priceChange);
      const currentValue = holding.quantity * currentPrice;
      const pnl = currentValue - holding.totalInvested;
      const pnlPercentage = holding.totalInvested > 0 ? (pnl / holding.totalInvested) * 100 : 0;

      return {
        ...holding,
        currentPrice: Math.round(currentPrice * 100) / 100,
        currentValue: Math.round(currentValue),
        pnl: Math.round(pnl),
        pnlPercentage: Math.round(pnlPercentage * 100) / 100,
        weightage: portfolioSummary.totalMarketValue > 0 ? 
          Math.round((currentValue / portfolioSummary.totalMarketValue) * 10000) / 100 : 0
      };
    });
  }, [portfolio, portfolioSummary.totalMarketValue]);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <Box sx={{ maxWidth: '1400px', margin: '0 auto', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
          Portfolio
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
          variant="outlined"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
                {formatCurrency(portfolioSummary.totalMarketValue)}
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                Total Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                {portfolioSummary.totalPnL >= 0 ? 
                  <TrendingUp color="success" /> :
                  <TrendingDown color="error" />
                }
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{ color: portfolioSummary.totalPnL >= 0 ? '#15803d !important' : '#dc2626 !important' }}
                >
                  {formatCurrency(Math.abs(portfolioSummary.totalPnL))}
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ color: portfolioSummary.totalPnL >= 0 ? '#15803d !important' : '#dc2626 !important', fontWeight: 500 }}
              >
                Total P&L ({formatPercentage(portfolioSummary.totalPnLPercentage)})
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
                {formatCurrency(portfolioSummary.totalInvested)}
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                Total Invested
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
                {formatCurrency(portfolioSummary.cashBalance)}
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                Available Cash
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Holdings Table */}
      <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab 
              label={`Holdings (${enrichedHoldings.length})`}
              sx={{ 
                fontWeight: 600,
                color: '#000000 !important',
                '&.Mui-selected': { color: '#3b82f6 !important' }
              }}
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {enrichedHoldings.length === 0 ? (
            <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#000000 !important' }}>
                No Holdings Yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#374151 !important' }} gutterBottom>
                Start investing in bonds to see your portfolio here
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/market')}
                sx={{ mt: 2 }}
              >
                Explore Bonds
              </Button>
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#000000 !important' }}>Bond</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Avg Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Current Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Market Value</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>P&L</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#000000 !important' }}>Weightage</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#000000 !important' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrichedHoldings.map((holding) => (
                    <TableRow key={holding.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {holding.bondName?.charAt(0) || 'B'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium" sx={{ color: '#000000 !important' }}>
                              {holding.bondName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#374151 !important' }}>
                              ID: {holding.bondId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#000000 !important', fontWeight: 500 }}>
                        {holding.quantity.toLocaleString()} fragments
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#000000 !important', fontWeight: 500 }}>
                        {formatCurrency(holding.avgPrice)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#000000 !important', fontWeight: 500 }}>
                        {formatCurrency(holding.currentPrice)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'medium', color: '#000000 !important' }}>
                        {formatCurrency(holding.currentValue)}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          {holding.pnl >= 0 ? 
                            <TrendingUp color="success" fontSize="small" /> :
                            <TrendingDown color="error" fontSize="small" />
                          }
                          <Box textAlign="right">
                            <Typography 
                              variant="body2"
                              sx={{ color: holding.pnl >= 0 ? '#15803d !important' : '#dc2626 !important', fontWeight: 600 }}
                            >
                              {formatCurrency(Math.abs(holding.pnl))}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ color: holding.pnl >= 0 ? '#15803d !important' : '#dc2626 !important' }}
                            >
                              ({formatPercentage(holding.pnlPercentage)})
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ minWidth: 60 }}>
                          <LinearProgress
                            variant="determinate"
                            value={holding.weightage}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" sx={{ color: '#374151 !important' }}>
                            {holding.weightage}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/trading/${holding.bondId}`)}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Portfolio;
