import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock portfolio data (you can replace with real API calls)
  const portfolioValue = 125750;
  const totalPnL = 8750;
  const todaysPnL = 1250;
  const totalInvestment = 117000;

  const performanceData = [
    { name: 'Jan', value: 110000 },
    { name: 'Feb', value: 115000 },
    { name: 'Mar', value: 112000 },
    { name: 'Apr', value: 118000 },
    { name: 'May', value: 122000 },
    { name: 'Jun', value: 125750 },
  ];

  const assetAllocation = [
    { name: 'Corporate Bonds', value: 65, color: '#1976d2' },
    { name: 'Government Bonds', value: 25, color: '#2e7d32' },
    { name: 'Cash', value: 10, color: '#ed6c02' },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: 'BUY',
      bond: 'HDFC Bank Ltd',
      quantity: 10,
      price: 1025.50,
      date: '2025-09-01',
      status: 'Completed',
    },
    {
      id: 2,
      type: 'SELL',
      bond: 'Tata Motors Ltd',
      quantity: 5,
      price: 1070.29,
      date: '2025-08-30',
      status: 'Completed',
    },
    {
      id: 3,
      type: 'BUY',
      bond: 'Reliance Industries',
      quantity: 8,
      price: 985.75,
      date: '2025-08-28',
      status: 'Pending',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, change, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {change && (
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
                >
                  {Math.abs(change).toLocaleString('en-IN')} ({((Math.abs(change) / totalInvestment) * 100).toFixed(2)}%)
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        <LinearProgress />
      </Box>
    );
  }

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
          <Button variant="contained" startIcon={<Add />} sx={{ mr: 1 }}>
            New Order
          </Button>
          <IconButton>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* KYC Alert */}
      {user?.kycStatus !== 'verified' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Complete your KYC verification to unlock full trading features.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Portfolio Value"
            value={`₹${portfolioValue.toLocaleString('en-IN')}`}
            change={totalPnL}
            icon={<AccountBalance />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total P&L"
            value={`₹${totalPnL.toLocaleString('en-IN')}`}
            change={totalPnL}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's P&L"
            value={`₹${todaysPnL.toLocaleString('en-IN')}`}
            change={todaysPnL}
            icon={<Assessment />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Trading Level"
            value={user?.trading?.level || 'Beginner'}
            icon={<TrendingUp />}
            color="warning"
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
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#1976d2"
                      strokeWidth={2}
                      dot={{ fill: '#1976d2' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                    >
                      {assetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box mt={2}>
                {assetAllocation.map((item) => (
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
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Recent Transactions
            </Typography>
            <Button size="small">View All</Button>
          </Box>
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
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Chip
                      label={transaction.type}
                      color={transaction.type === 'BUY' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{transaction.bond}</TableCell>
                  <TableCell align="right">{transaction.quantity}</TableCell>
                  <TableCell align="right">₹{transaction.price.toLocaleString('en-IN')}</TableCell>
                  <TableCell align="right">
                    ₹{(transaction.quantity * transaction.price).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      color={transaction.status === 'Completed' ? 'success' : 'warning'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
