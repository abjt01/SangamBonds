import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Paper,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Assessment,
  Refresh,
  Add,
  ArrowUpward,
  ArrowDownward,
  ShowChart,
  Timeline,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { bondsAPI, ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, portfolio, refreshUserData } = useAuth(); // Use portfolio from context
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate portfolio data from context instead of API call
  const portfolioData = useMemo(() => {
    if (!portfolio || portfolio.length === 0) {
      return {
        summary: {
          totalMarketValue: 0,
          totalPnL: 0,
          totalPnLPercentage: 0,
          totalInvested: 0
        },
        performanceHistory: [],
        sectorAllocation: [],
        recentTransactions: []
      };
    }

    let totalInvested = 0;
    let totalCurrentValue = 0;
    const sectorMap = new Map();
    
    // Calculate current values and sector allocation
    portfolio.forEach(holding => {
      totalInvested += holding.totalInvested;
      
      // Simulate current price (in real app, you'd get this from market data)
      const priceChange = (Math.random() - 0.5) * 0.1; // ±5% change
      const currentPrice = holding.avgPrice * (1 + priceChange);
      const currentValue = holding.quantity * currentPrice;
      totalCurrentValue += currentValue;
      
      // Sector allocation (simplified - you'd get actual sector from bond data)
      const sector = 'Banking & Financial Services'; // Mock sector
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + currentValue);
    });

    const totalPnL = totalCurrentValue - totalInvested;
    const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    // Create sector allocation array
    const sectorAllocation = Array.from(sectorMap.entries()).map(([name, value], index) => ({
      name,
      value: Math.round((value / totalCurrentValue) * 100),
      color: ['#1976d2', '#ed6c02', '#2e7d32', '#9c27b0', '#f57c00'][index % 5]
    }));

    // Generate mock performance history
    const performanceHistory = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      value: totalCurrentValue * (0.95 + Math.random() * 0.1),
      invested: totalInvested
    }));

    // Generate mock recent transactions from portfolio
    const recentTransactions = portfolio.slice(0, 5).map((holding, index) => ({
      id: `txn_${index}`,
      type: 'BUY',
      bondName: holding.bondName,
      quantity: holding.quantity,
      price: holding.avgPrice,
      value: holding.totalInvested,
      date: holding.purchaseDate || new Date(),
      status: 'completed'
    }));

    return {
      summary: {
        totalMarketValue: Math.round(totalCurrentValue),
        totalPnL: Math.round(totalPnL),
        totalPnLPercentage: Math.round(totalPnLPercentage * 100) / 100,
        totalInvested: Math.round(totalInvested)
      },
      performanceHistory,
      sectorAllocation,
      recentTransactions
    };
  }, [portfolio]);

  // Fetch additional dashboard data (not portfolio-related)
  const fetchDashboardData = async () => {
    try {
      const [marketResponse, orderStatsResponse] = await Promise.all([
        bondsAPI.getMarketOverview(),
        ordersAPI.getOrderStats()
      ]);

      if (marketResponse.data.success) {
        setMarketData(marketResponse.data.data);
      }

      if (orderStatsResponse.data.success) {
        setOrderStats(orderStatsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardData(),
      refreshUserData()
    ]);
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const StatCard = ({ title, value, change, icon, color = 'primary', isLoading = false }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        {isLoading ? (
          <Box>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {title}
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {value}
              </Typography>
              {change !== undefined && (
                <Box display="flex" alignItems="center" mt={1}>
                  {change >= 0 ? (
                    <ArrowUpward sx={{ color: 'success.main', fontSize: 16 }} />
                  ) : (
                    <ArrowDownward sx={{ color: 'error.main', fontSize: 16 }} />
                  )}
                  <Typography
                    variant="body2"
                    color={change >= 0 ? 'success.main' : 'error.main'}
                    fontWeight="medium"
                    ml={0.5}
                  >
                    {Math.abs(change).toLocaleString('en-IN')}
                    {typeof change === 'number' && change % 1 !== 0 ? '%' : ''}
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar sx={{ bgcolor: `${color}.light`, width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your investments today
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            sx={{ mr: 1 }}
            onClick={() => navigate('/market')}
          >
            New Order
          </Button>
          <IconButton 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <Refresh sx={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }} />
          </IconButton>
        </Box>
      </Box>

      {/* KYC Alert */}
      {user?.kycStatus !== 'verified' && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/profile')}>
              Complete KYC
            </Button>
          }
        >
          <Typography variant="body2">
            Complete your KYC verification to unlock full trading features and higher limits.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Portfolio Value"
            value={formatCurrency(portfolioData.summary.totalMarketValue)}
            change={portfolioData.summary.totalPnLPercentage}
            icon={<AccountBalance />}
            color="primary"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total P&L"
            value={formatCurrency(portfolioData.summary.totalPnL)}
            change={portfolioData.summary.totalPnLPercentage}
            icon={<TrendingUp />}
            color={portfolioData.summary.totalPnL >= 0 ? "success" : "error"}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Orders"
            value={orderStats?.activeOrders || 0}
            icon={<Assessment />}
            color="info"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Trading Level"
            value={user?.trading?.level || 'Beginner'}
            change={user?.trading?.points}
            icon={<ShowChart />}
            color="warning"
            isLoading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={3}>
        {/* Portfolio Performance Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Portfolio Performance
              </Typography>
              <Box height={300}>
                {loading ? (
                  <Skeleton variant="rectangular" width="100%" height={300} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData.performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#1976d2"
                        strokeWidth={2}
                        dot={{ fill: '#1976d2', r: 4 }}
                        name="Portfolio Value"
                      />
                      <Line
                        type="monotone"
                        dataKey="invested"
                        stroke="#ed6c02"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Invested Amount"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Asset Allocation */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Asset Allocation
              </Typography>
              <Box height={250}>
                {loading || portfolioData.sectorAllocation.length === 0 ? (
                  <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioData.sectorAllocation}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${value}%`}
                      >
                        {portfolioData.sectorAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
              <Box mt={2}>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Box key={index} display="flex" alignItems="center" mb={1}>
                      <Skeleton variant="circular" width={12} height={12} sx={{ mr: 1 }} />
                      <Skeleton variant="text" width="70%" height={20} />
                    </Box>
                  ))
                ) : (
                  portfolioData.sectorAllocation.map((item) => (
                    <Box key={item.name} display="flex" alignItems="center" mb={1}>
                      <Box
                        width={12}
                        height={12}
                        bgcolor={item.color}
                        borderRadius="50%"
                        mr={1}
                      />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {item.value}%
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Paper elevation={2}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Recent Transactions
              </Typography>
              <Button 
                size="small" 
                startIcon={<Timeline />}
                onClick={() => navigate('/portfolio')}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <Box>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Box key={index} display="flex" alignItems="center" py={1}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box flexGrow={1}>
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton variant="text" width="40%" height={16} />
                    </Box>
                    <Skeleton variant="text" width="20%" height={20} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Bond</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolioData.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          color={transaction.type === 'BUY' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{transaction.bondName}</TableCell>
                      <TableCell align="right">{transaction.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(transaction.price)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(transaction.value)}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color="success"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {portfolioData.recentTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={2}>
                          No transactions yet. Start trading to see your activity here.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
};

export default Dashboard;