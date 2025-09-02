import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Paper,
  Grid
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const TradingChart = ({ bondId }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('1D');

  useEffect(() => {
    if (bondId) {
      generateChartData();
    }
  }, [bondId, selectedPeriod]);

  const generateChartData = () => {
    setLoading(true);
    
    const periods = {
      '1D': { points: 24, interval: 'hour' },
      '1W': { points: 7, interval: 'day' },
      '1M': { points: 30, interval: 'day' },
      '3M': { points: 90, interval: 'day' },
      '6M': { points: 180, interval: 'day' },
      '1Y': { points: 365, interval: 'day' }
    };

    const period = periods[selectedPeriod];
    const data = [];
    let basePrice = 1025.50; // Starting price
    
    for (let i = 0; i < period.points; i++) {
      const date = new Date();
      if (period.interval === 'hour') {
        date.setHours(date.getHours() - (period.points - i));
      } else {
        date.setDate(date.getDate() - (period.points - i));
      }
      
      // Add realistic price movement
      const change = (Math.random() - 0.5) * 8;
      basePrice = Math.max(980, Math.min(1080, basePrice + change));
      
      data.push({
        time: period.interval === 'hour' ? 
          date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) :
          date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: Math.round(basePrice * 100) / 100,
        volume: Math.floor(Math.random() * 1000) + 100
      });
    }
    
    setChartData(data);
    setLoading(false);
  };

  // FIXED: Add null/undefined checks
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '₹0.00';
    }
    return `₹${Number(value).toFixed(2)}`;
  };

  const formatVolume = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    return Number(value).toLocaleString();
  };

  // FIXED: Add safety checks in CustomTooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0 && payload[0] && payload[0].value !== undefined) {
      return (
        <Paper
          sx={{
            p: 2,
            bgcolor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          <Typography variant="body2" sx={{ color: '#000000 !important', fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#3b82f6 !important', fontWeight: 500 }}>
            Price: {formatCurrency(payload[0].value)}
          </Typography>
          {payload[1] && payload[1].value !== undefined && (
            <Typography variant="body2" sx={{ color: '#374151 !important', fontWeight: 500 }}>
              Volume: {formatVolume(payload[1].value)}
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ color: '#000000 !important', fontWeight: 700 }}>
          Price Chart
        </Typography>
        <Box 
          height={400} 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          sx={{ bgcolor: '#f9fafb', borderRadius: 2, border: '1px solid #e5e7eb' }}
        >
          <Typography sx={{ color: '#374151 !important' }}>Loading chart...</Typography>
        </Box>
      </Box>
    );
  }

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const highPrice = chartData.length > 0 ? Math.max(...chartData.map(d => d.price || 0)) : 0;
  const lowPrice = chartData.length > 0 ? Math.min(...chartData.map(d => d.price || 0)) : 0;
  const totalVolume = chartData.reduce((sum, d) => sum + (d.volume || 0), 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ color: '#000000 !important', fontWeight: 700 }}>
          Price Chart
        </Typography>
        
        <ButtonGroup size="small" variant="outlined">
          {['1D', '1W', '1M', '3M', '6M', '1Y'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'contained' : 'outlined'}
              onClick={() => setSelectedPeriod(period)}
              sx={{
                fontWeight: 600,
                color: selectedPeriod === period ? '#ffffff !important' : '#374151 !important',
                bgcolor: selectedPeriod === period ? '#3b82f6' : 'transparent',
                '&:hover': {
                  bgcolor: selectedPeriod === period ? '#2563eb' : '#f3f4f6'
                }
              }}
            >
              {period}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      <Paper sx={{ p: 2, bgcolor: 'white', border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12, fill: '#374151' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12, fill: '#374151' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ 
                r: 6, 
                stroke: '#3b82f6', 
                strokeWidth: 3,
                fill: '#ffffff'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>

      {/* Chart Statistics */}
      <Grid container spacing={2} mt={2}>
        <Grid item xs={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f0fdf4', border: '1px solid #dcfce7' }}>
            <Typography variant="caption" sx={{ color: '#374151 !important', fontWeight: 600 }}>
              Current
            </Typography>
            <Typography variant="h6" sx={{ color: '#15803d !important', fontWeight: 700 }}>
              {formatCurrency(currentPrice)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ecfdf5', border: '1px solid #d1fae5' }}>
            <Typography variant="caption" sx={{ color: '#374151 !important', fontWeight: 600 }}>
              High
            </Typography>
            <Typography variant="h6" sx={{ color: '#10b981 !important', fontWeight: 700 }}>
              {formatCurrency(highPrice)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
            <Typography variant="caption" sx={{ color: '#374151 !important', fontWeight: 600 }}>
              Low
            </Typography>
            <Typography variant="h6" sx={{ color: '#dc2626 !important', fontWeight: 700 }}>
              {formatCurrency(lowPrice)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#eff6ff', border: '1px solid #dbeafe' }}>
            <Typography variant="caption" sx={{ color: '#374151 !important', fontWeight: 600 }}>
              Volume
            </Typography>
            <Typography variant="h6" sx={{ color: '#2563eb !important', fontWeight: 700 }}>
              {formatVolume(totalVolume)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TradingChart;
