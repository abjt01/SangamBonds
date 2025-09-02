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
  TableHead,
  TableRow,
  TableContainer,
  Chip,
  Button,
  IconButton,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  FileDownload,
  Visibility,
  AccountBalance,
  Assessment,
  Timeline,
  PieChart,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { portfolioAPI } from '../services/api';
import toast from 'react-hot-toast';

const Portfolio = () => {
  const { user } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('1M');

  const fetchPortfolioData = async () => {
    try {
      const response = await portfolioAPI.getPortfolio();
      if (response.data.success) {
        setPortfolioData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async (period) => {
    try {
      const response = await portfolioAPI.getPortfolioPerformance(period);
      if (response.data.success && portfolioData) {
        setPortfolioData(prev => ({
          ...prev,
          performanceHistory: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  useEffect(() => {
    if (portfolioData) {
      fetchPerformanceData(timeRange);
    }
  }, [timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolioData();
    setRefreshing(false);
    toast.success('Portfolio refreshed');
  };

  const handleExport = () => {
    if (!portfolioData) return;
    
    const csvData = portfolioData.holdings.map(holding => ({
      'Bond Name': holding.bondName,
      'Symbol': holding.symbol,
      'Quantity': holding.quantity,
      'Average Price': holding.avgPrice,
      'Current Price': holding.currentPrice,
      'Invested Value': holding.investedValue,
      'Current Value': holding.currentValue,
      'P&L': holding.pnl,
      'P&L %': holding.pnlPercentage.toFixed(2),
      'Sector': holding.sector,
      'Rating': holding.rating,
      'Weightage %': holding.weightage.toFixed(2)
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Portfolio exported successfully');
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'primary', trend, isLoading = false }) => (
    <Card sx={{ height: '100%' }}>
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
              <Typography variant="h5" component="div" fontWeight="bold">
                {value}
              </Typography>
              {subtitle && (
                <Box display="flex" alignItems="center" mt={0.5}>
                  {trend !== undefined && (trend >= 0 ? (
                    <ArrowUpward sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                  ) : (
                    <ArrowDownward sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                  ))}
                  <Typography
                    variant="body2"
                    color={trend !== undefined && trend >= 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary'}
                  >
                    {subtitle}
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar sx={{ bgcolor: `${color}.light` }}>
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
            Portfolio 💼
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your bond investments and performance
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<FileDownload />} 
            sx={{ mr: 1 }}
            onClick={handleExport}
            disabled={!portfolioData || loading}
          >
            Export
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

      {/* Portfolio Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Investment"
            value={portfolioData ? formatCurrency(portfolioData.summary.totalInvested) : formatCurrency(0)}
            icon={<AccountBalance />}
            color="primary"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current Value"
            value={portfolioData ? formatCurrency(portfolioData.summary.totalMarketValue) : formatCurrency(0)}
            subtitle={portfolioData ? `${portfolioData.summary.totalPnLPercentage >= 0 ? '+' : ''}${portfolioData.summary.totalPnLPercentage.toFixed(2)}%` : '0.00%'}
            trend={portfolioData?.summary.totalPnL}
            icon={<Assessment />}
            color="success"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total P&L"
            value={portfolioData ? formatCurrency(portfolioData.summary.totalPnL) : formatCurrency(0)}
            subtitle={portfolioData ? `${portfolioData.summary.totalPnLPercentage.toFixed(2)}% return` : '0.00% return'}
            trend={portfolioData?.summary.totalPnL}
            icon={<TrendingUp />}
            color={portfolioData?.summary.totalPnL >= 0 ? 'success' : 'error'}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Holdings"
            value={portfolioData?.summary.totalHoldings || 0}
            subtitle="Active positions"
            icon={<PieChart />}
            color="info"
            isLoading={loading}
          />
        </Grid>
      </Grid>

      {/* Performance Chart & Sector Allocation */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Portfolio Performance</Typography>
                <FormControl size="small">
                  <Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <MenuItem value="1W">1W</MenuItem>
                    <MenuItem value="1M">1M</MenuItem>
                    <MenuItem value="3M">3M</MenuItem>
                    <MenuItem value="6M">6M</MenuItem>
                    <MenuItem value="1Y">1Y</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box height={300}>
                {loading ? (
                  <Skeleton variant="rectangular" width="100%" height={300} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData?.performanceHistory || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#1976d2"
                        strokeWidth={2}
                        name="Current Value"
                      />
                      <Line
                        type="monotone"
                        dataKey="invested"
                        stroke="#ed6c02"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Invested Value"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sector Allocation
              </Typography>
              <Box height={250}>
                {loading ? (
                  <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={portfolioData?.sectorAllocation || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ value }) => `${value}%`}
                      >
                        {portfolioData?.sectorAllocation?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
              </Box>
              <Box mt={1}>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Box key={index} display="flex" alignItems="center" mb={0.5}>
                      <Skeleton variant="circular" width={12} height={12} sx={{ mr: 1 }} />
                      <Skeleton variant="text" width="70%" height={20} />
                    </Box>
                  ))
                ) : (
                  portfolioData?.sectorAllocation?.map((item) => (
                    <Box key={item.name} display="flex" alignItems="center" mb={0.5}>
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

      {/* Tabs for Holdings and Transactions */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
            <Tab label="Current Holdings" />
            <Tab label="Recent Transactions" />
          </Tabs>

          {tabValue === 0 ? (
            // Holdings Table
            <>
              <Typography variant="h6" gutterBottom>
                Current Holdings ({portfolioData?.holdings?.length || 0})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bond</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Avg Price</TableCell>
                      <TableCell align="right">Current Price</TableCell>
                      <TableCell align="right">Invested Value</TableCell>
                      <TableCell align="right">Market Value</TableCell>
                      <TableCell align="right">P&L</TableCell>
                      <TableCell align="center">Weightage</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                              <Box>
                                <Skeleton variant="text" width={120} height={20} />
                                <Skeleton variant="text" width={80} height={16} />
                              </Box>
                            </Box>
                          </TableCell>
                          {Array.from({ length: 8 }).map((_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton variant="text" width="100%" height={20} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      portfolioData?.holdings?.map((holding) => (
                        <TableRow key={holding.bondId} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.light' }}>
                                {holding.symbol.substring(0, 2)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {holding.bondName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {holding.symbol} • {holding.couponRate}% • {holding.rating}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {holding.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatCurrency(holding.avgPrice)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(holding.currentPrice)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatCurrency(holding.investedValue)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(holding.currentValue)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box>
                              <Typography
                                variant="body2"
                                color={holding.pnl >= 0 ? 'success.main' : 'error.main'}
                                fontWeight="medium"
                              >
                                {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color={holding.pnl >= 0 ? 'success.main' : 'error.main'}
                              >
                                ({holding.pnlPercentage >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%)
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {holding.weightage.toFixed(1)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={holding.weightage}
                              sx={{ width: 40, height: 4, mt: 0.5 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {!loading && (!portfolioData?.holdings || portfolioData.holdings.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <Box py={4}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No Holdings Yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              Start trading to see your portfolio here
                            </Typography>
                            <Button 
                              variant="contained" 
                              onClick={() => window.location.href = '/trading'}
                            >
                              Start Trading
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            // Transactions Table
            <>
              <Typography variant="h6" gutterBottom>
                Recent Transactions ({portfolioData?.recentTransactions?.length || 0})
              </Typography>
              <TableContainer>
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
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: 7 }).map((_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton variant="text" width="100%" height={20} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      portfolioData?.recentTransactions?.map((transaction) => (
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
                      ))
                    )}
                    {!loading && (!portfolioData?.recentTransactions || portfolioData.recentTransactions.length === 0) && (
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
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Portfolio;
