import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Chip,
  Alert,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  SwapVert,
  Timeline,
  BookmarkBorder,
  Info,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Trading = () => {
  const { bondId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedBond, setSelectedBond] = useState(bondId || 'HDFC001');
  const [orderType, setOrderType] = useState('buy');
  const [priceType, setPriceType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Mock bond data
  const bondData = {
    HDFC001: {
      bondId: 'HDFC001',
      name: 'HDFC Bank Ltd',
      symbol: 'HDFCBANK',
      currentPrice: 1025.50,
      priceChange: { absolute: 15.50, percentage: 1.54 },
      high: 1035.20,
      low: 1018.75,
      volume: 2500,
      couponRate: 6.8,
      rating: 'AAA',
    }
  };

  const currentBond = bondData[selectedBond] || bondData.HDFC001;

  // Mock price chart data
  const priceChartData = [
    { time: '09:15', price: 1010.25 },
    { time: '09:30', price: 1012.80 },
    { time: '09:45', price: 1015.20 },
    { time: '10:00', price: 1018.45 },
    { time: '10:15', price: 1022.10 },
    { time: '10:30', price: 1025.50 },
    { time: '10:45', price: 1023.80 },
    { time: '11:00', price: 1025.50 },
  ];

  // Mock order book data
  const orderBookData = {
    bids: [
      { price: 1025.25, quantity: 150, orders: 5 },
      { price: 1025.00, quantity: 200, orders: 8 },
      { price: 1024.75, quantity: 100, orders: 3 },
      { price: 1024.50, quantity: 250, orders: 12 },
      { price: 1024.25, quantity: 180, orders: 7 },
      { price: 1024.00, quantity: 300, orders: 15 },
      { price: 1023.75, quantity: 120, orders: 4 },
      { price: 1023.50, quantity: 220, orders: 9 },
    ],
    asks: [
      { price: 1025.50, quantity: 100, orders: 4 },
      { price: 1025.75, quantity: 180, orders: 6 },
      { price: 1026.00, quantity: 150, orders: 7 },
      { price: 1026.25, quantity: 200, orders: 9 },
      { price: 1026.50, quantity: 120, orders: 5 },
      { price: 1026.75, quantity: 300, orders: 14 },
      { price: 1027.00, quantity: 250, orders: 11 },
      { price: 1027.25, quantity: 180, orders: 8 },
    ]
  };

  // Mock recent trades
  const recentTrades = [
    { price: 1025.50, quantity: 50, time: '11:05:23', type: 'buy' },
    { price: 1025.25, quantity: 75, time: '11:04:45', type: 'sell' },
    { price: 1025.50, quantity: 100, time: '11:03:12', type: 'buy' },
    { price: 1025.75, quantity: 25, time: '11:02:58', type: 'buy' },
    { price: 1025.25, quantity: 150, time: '11:01:34', type: 'sell' },
    { price: 1025.50, quantity: 80, time: '11:00:22', type: 'buy' },
  ];

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    // Handle order submission
    const orderData = {
      bondId: selectedBond,
      type: orderType,
      priceType,
      quantity: parseInt(quantity),
      price: priceType === 'limit' ? parseFloat(price) : currentBond.currentPrice,
    };
    console.log('Order submitted:', orderData);
    // Add success message or API call here
  };

  const maxQuantity = orderType === 'buy' ? Math.floor(user?.wallet?.balance / currentBond.currentPrice) : 100;
  const orderValue = quantity && priceType === 'limit' ? quantity * parseFloat(price || 0) : quantity * currentBond.currentPrice;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Trading 📊
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Trade corporate bonds with real-time order matching
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />}>
          Refresh Data
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Bond Info & Chart */}
        <Grid item xs={12} md={8}>
          {/* Bond Info Card */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ width: 50, height: 50, mr: 2, bgcolor: 'primary.light' }}>
                    {currentBond.symbol.substring(0, 2)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {currentBond.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentBond.symbol} • {currentBond.couponRate}% • {currentBond.rating}
                    </Typography>
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h5" fontWeight="bold">
                    ₹{currentBond.currentPrice.toFixed(2)}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    {currentBond.priceChange.percentage >= 0 ? (
                      <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    ) : (
                      <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                    )}
                    <Typography
                      color={currentBond.priceChange.percentage >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="medium"
                    >
                      {currentBond.priceChange.percentage >= 0 ? '+' : ''}{currentBond.priceChange.percentage.toFixed(2)}%
                      ({currentBond.priceChange.percentage >= 0 ? '+' : ''}₹{currentBond.priceChange.absolute.toFixed(2)})
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">Day High</Typography>
                  <Typography variant="body2" fontWeight="medium">₹{currentBond.high}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">Day Low</Typography>
                  <Typography variant="body2" fontWeight="medium">₹{currentBond.low}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">Volume</Typography>
                  <Typography variant="body2" fontWeight="medium">{currentBond.volume.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">Coupon</Typography>
                  <Typography variant="body2" fontWeight="medium">{currentBond.couponRate}%</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Price Chart */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Price Chart</Typography>
                <Box>
                  <Button size="small" variant="outlined" sx={{ mr: 1 }}>1D</Button>
                  <Button size="small">5D</Button>
                  <Button size="small" sx={{ ml: 1 }}>1M</Button>
                </Box>
              </Box>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Price']} />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#1976d2"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Order Form & Order Book */}
        <Grid item xs={12} md={4}>
          {/* Order Form */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Place Order
              </Typography>
              <Box component="form" onSubmit={handleOrderSubmit}>
                <Tabs
                  value={orderType}
                  onChange={(e, newValue) => setOrderType(newValue)}
                  sx={{ mb: 2 }}
                >
                  <Tab label="Buy" value="buy" sx={{ minWidth: 80 }} />
                  <Tab label="Sell" value="sell" sx={{ minWidth: 80 }} />
                </Tabs>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Order Type</InputLabel>
                  <Select
                    value={priceType}
                    label="Order Type"
                    onChange={(e) => setPriceType(e.target.value)}
                  >
                    <MenuItem value="market">Market Order</MenuItem>
                    <MenuItem value="limit">Limit Order</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  helperText={`Max: ${maxQuantity.toLocaleString()}`}
                  sx={{ mb: 2 }}
                />

                {priceType === 'limit' && (
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    InputProps={{
                      startAdornment: '₹',
                    }}
                    sx={{ mb: 2 }}
                  />
                )}

                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Order Value: ₹{orderValue ? orderValue.toLocaleString() : '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Balance: ₹{user?.wallet?.balance?.toLocaleString()}
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color={orderType === 'buy' ? 'success' : 'error'}
                  disabled={!quantity || (priceType === 'limit' && !price)}
                >
                  {orderType === 'buy' ? 'Buy' : 'Sell'} {currentBond.symbol}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Order Book */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Book
              </Typography>
              <Grid container spacing={1}>
                {/* Asks (Sell Orders) */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="error.main" gutterBottom>
                    Asks (Sell)
                  </Typography>
                  <TableContainer sx={{ maxHeight: 200 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Price</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Orders</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderBookData.asks.slice(0, 8).reverse().map((ask, index) => (
                          <TableRow key={index} sx={{ bgcolor: 'error.50' }}>
                            <TableCell>₹{ask.price}</TableCell>
                            <TableCell align="right">{ask.quantity}</TableCell>
                            <TableCell align="right">{ask.orders}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Spread */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip
                      label={`Spread: ₹${(orderBookData.asks[0].price - orderBookData.bids[0].price).toFixed(2)}`}
                      size="small"
                    />
                  </Divider>
                </Grid>

                {/* Bids (Buy Orders) */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    Bids (Buy)
                  </Typography>
                  <TableContainer sx={{ maxHeight: 200 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Price</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Orders</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderBookData.bids.slice(0, 8).map((bid, index) => (
                          <TableRow key={index} sx={{ bgcolor: 'success.50' }}>
                            <TableCell>₹{bid.price}</TableCell>
                            <TableCell align="right">{bid.quantity}</TableCell>
                            <TableCell align="right">{bid.orders}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Trades */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Trades
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="center">Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTrades.map((trade, index) => (
                  <TableRow key={index}>
                    <TableCell>{trade.time}</TableCell>
                    <TableCell align="right">₹{trade.price}</TableCell>
                    <TableCell align="right">{trade.quantity}</TableCell>
                    <TableCell align="right">₹{(trade.price * trade.quantity).toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={trade.type.toUpperCase()}
                        size="small"
                        color={trade.type === 'buy' ? 'success' : 'error'}
                        variant="outlined"
                      />
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

export default Trading;
