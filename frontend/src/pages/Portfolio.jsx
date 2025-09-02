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
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';

const Portfolio = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('1M');

  // Mock portfolio holdings data
  const [holdings] = useState([
    {
      bondId: 'HDFC001',
      name: 'HDFC Bank Ltd',
      symbol: 'HDFCBANK',
      quantity: 15,
      avgPrice: 1020.25,
      currentPrice: 1025.50,
      marketValue: 15382.50,
      investedValue: 15303.75,
      pnl: 78.75,
      pnlPercentage: 0.51,
      couponRate: 6.8,
      maturityDate: '2030-06-15',
      rating: 'AAA',
      sector: 'Banking',
      weightage: 32.5,
    },
    {
      bondId: 'TATA001',
      name: 'Tata Motors Ltd',
      symbol: 'TATAMOTORS',
      quantity: 8,
      avgPrice: 1080.00,
      currentPrice: 1070.29,
      marketValue: 8562.32,
      investedValue: 8640.00,
      pnl: -77.68,
      pnlPercentage: -0.90,
      couponRate: 7.5,
      maturityDate: '2028-12-31',
      rating: 'AA',
      sector: 'Automotive',
      weightage: 18.1,
    },
    {
      bondId: 'RIL001',
      name: 'Reliance Industries Ltd',
      symbol: 'RELIANCE',
      quantity: 12,
      avgPrice: 975.50,
      currentPrice: 985.75,
      marketValue: 11829.00,
      investedValue: 11706.00,
      pnl: 123.00,
      pnlPercentage: 1.05,
      couponRate: 6.5,
      maturityDate: '2029-03-20',
      rating: 'AA+',
      sector: 'Oil & Gas',
      weightage: 25.0,
    },
    {
      bondId: 'ITC001',
      name: 'ITC Limited',
      symbol: 'ITC',
      quantity: 10,
      avgPrice: 1010.00,
      currentPrice: 1015.20,
      marketValue: 10152.00,
      investedValue: 10100.00,
      pnl: 52.00,
      pnlPercentage: 0.51,
      couponRate: 6.0,
      maturityDate: '2027-08-10',
      rating: 'AA+',
      sector: 'FMCG',
      weightage: 21.4,
    },
  ]);

  const totalInvestment = holdings.reduce((sum, holding) => sum + holding.investedValue, 0);
  const totalMarketValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalPnL = holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  const totalPnLPercentage = (totalPnL / totalInvestment) * 100;

  // Mock performance data
  const performanceData = [
    { date: '2025-01-01', value: 45000, invested: 45000 },
    { date: '2025-02-01', value: 46200, invested: 45000 },
    { date: '2025-03-01', value: 44800, invested: 45000 },
    { date: '2025-04-01', value: 47500, invested: 46000 },
    { date: '2025-05-01', value: 46800, invested: 46000 },
    { date: '2025-06-01', value: 48200, invested: 46000 },
    { date: '2025-07-01', value: 47925, invested: 46000 },
    { date: '2025-08-01', value: 46925, invested: 46000 },
    { date: '2025-09-01', value: totalMarketValue, invested: totalInvestment },
  ];

  // Sector allocation
  const sectorAllocation = [
    { name: 'Banking', value: 32.5, color: '#1976d2' },
    { name: 'Oil & Gas', value: 25.0, color: '#2e7d32' },
    { name: 'FMCG', value: 21.4, color: '#ed6c02' },
    { name: 'Automotive', value: 18.1, color: '#d32f2f' },
    { name: 'Cash', value: 3.0, color: '#7b1fa2' },
  ];

  const StatCard = ({ title, value, subtitle, icon, color = 'primary', trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
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
                {trend && (trend >= 0 ? (
                  <ArrowUpward sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <ArrowDownward sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                ))}
                <Typography
                  variant="body2"
                  color={trend && trend >= 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary'}
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
      </CardContent>
    </Card>
  );

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
          <Button variant="outlined" startIcon={<FileDownload />} sx={{ mr: 1 }}>
            Export
          </Button>
          <IconButton onClick={() => setLoading(true)}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Portfolio Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Investment"
            value={`₹${totalInvestment.toLocaleString('en-IN')}`}
            icon={<AccountBalance />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current Value"
            value={`₹${totalMarketValue.toLocaleString('en-IN')}`}
            subtitle={`₹${Math.abs(totalPnL).toLocaleString('en-IN')} (${totalPnLPercentage.toFixed(2)}%)`}
            trend={totalPnL}
            icon={<Assessment />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total P&L"
            value={`₹${totalPnL.toLocaleString('en-IN')}`}
            subtitle={`${totalPnLPercentage.toFixed(2)}% return`}
            trend={totalPnL}
            icon={<TrendingUp />}
            color={totalPnL >= 0 ? 'success' : 'error'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Holdings"
            value={holdings.length}
            subtitle="Active positions"
            icon={<PieChart />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Performance Chart */}
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
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
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
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={sectorAllocation}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ value }) => `${value}%`}
                    >
                      {sectorAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Box>
              <Box mt={1}>
                {sectorAllocation.map((item) => (
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
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Holdings Table */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
            <Typography variant="h6">Current Holdings</Typography>
          </Box>
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
                {holdings.map((holding) => (
                  <TableRow key={holding.bondId} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.light' }}>
                          {holding.symbol.substring(0, 2)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {holding.name}
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
                        ₹{holding.avgPrice.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        ₹{holding.currentPrice.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ₹{holding.investedValue.toLocaleString('en-IN')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        ₹{holding.marketValue.toLocaleString('en-IN')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <Typography
                          variant="body2"
                          color={holding.pnl >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="medium"
                        >
                          {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toFixed(2)}
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
                        {holding.weightage}%
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Portfolio;
