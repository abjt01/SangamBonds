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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  SwapVert,
  Timeline,
  BookmarkBorder,
  Info,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bondsAPI, ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const Trading = () => {
  const { bondId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  
  // State
  const [selectedBond, setSelectedBond] = useState(bondId || '');
  const [bondData, setBondData] = useState(null);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [recentTrades, setRecentTrades] = useState([]);
  const [priceChart, setPriceChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(false);
  
  // Order Form State
  const [orderType, setOrderType] = useState('buy');
  const [priceType, setPriceType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Available bonds for selection
  const [availableBonds, setAvailableBonds] = useState([]);

  const fetchBondData = async (bondIdToFetch) => {
    try {
      const response = await bondsAPI.getBondById(bondIdToFetch);
      if (response.data.success) {
        setBondData(response.data.data.bond);
        setPrice(response.data.data.bond.currentPrice.toString());
      }
    } catch (error) {
      console.error('Error fetching bond data:', error);
      toast.error('Failed to load bond data');
    }
  };

  const fetchOrderBook = async (bondIdToFetch) => {
    try {
      const response = await ordersAPI.getOrderBook(bondIdToFetch, 10);
      if (response.data.success) {
        setOrderBook(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  };

  const fetchRecentTrades = async (bondIdToFetch) => {
    try {
      const response = await ordersAPI.getRecentTrades(bondIdToFetch, 20);
      if (response.data.success) {
        setRecentTrades(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching recent trades:', error);
    }
  };

  const fetchAvailableBonds = async () => {
    try {
      const response = await bondsAPI.getAllBonds({ limit: 50 });
      if (response.data.success) {
        setAvailableBonds(response.data.data.bonds);
      }
    } catch (error) {
      console.error('Error fetching available bonds:', error);
    }
  };

  const generateMockPriceChart = (currentPrice) => {
    const data = [];
    let basePrice = currentPrice * 0.98;
    
    for (let i = 0; i < 24; i++) {
      const time = `${9 + Math.floor(i / 4)}:${(i % 4) * 15 || '00'}`;
      basePrice += (Math.random() - 0.5) * currentPrice * 0.005;
      data.push({
        time,
        price: Math.max(basePrice, currentPrice * 0.95)
      });
    }
    
    data[data.length - 1].price = currentPrice;
    return data;
  };

  useEffect(() => {
    const initializeTrading = async () => {
      setLoading(true);
      
      // Get available bonds first
      await fetchAvailableBonds();
      
      const bondToLoad = bondId || 'HDFC001';
      setSelectedBond(bondToLoad);
      
      await Promise.all([
        fetchBondData(bondToLoad),
        fetchOrderBook(bondToLoad),
        fetchRecentTrades(bondToLoad)
      ]);
      
      setLoading(false);
    };

    initializeTrading();
  }, [bondId]);

  useEffect(() => {
    if (bondData) {
      setPriceChart(generateMockPriceChart(bondData.currentPrice));
    }
  }, [bondData]);

  const handleBondChange = async (newBondId) => {
    setSelectedBond(newBondId);
    setLoading(true);
    
    await Promise.all([
      fetchBondData(newBondId),
      fetchOrderBook(newBondId),
      fetchRecentTrades(newBondId)
    ]);
    
    navigate(`/trading/${newBondId}`, { replace: true });
    setLoading(false);
  };

  const validateOrder = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return false;
    }

    if (priceType === 'limit' && (!price || parseFloat(price) <= 0)) {
      toast.error('Please enter a valid price');
      return false;
    }

    if (user?.kycStatus !== 'verified') {
      const orderValue = parseInt(quantity) * (priceType === 'market' ? bondData.currentPrice : parseFloat(price));
      if (orderValue > 10000) {
        toast.error('KYC verification required for orders above ₹10,000');
        return false;
      }
    }

    if (orderType === 'buy') {
      const orderValue = parseInt(quantity) * (priceType === 'market' ? bondData.currentPrice : parseFloat(price));
      if (user.wallet.balance < orderValue) {
        toast.error('Insufficient balance');
        return false;
      }

      if (bondData.availableTokens < parseInt(quantity)) {
        toast.error('Insufficient tokens available');
        return false;
      }
    }

    return true;
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOrder()) {
      return;
    }

    setConfirmDialog(true);
  };

  const confirmOrder = async () => {
    try {
      setSubmitting(true);
      setConfirmDialog(false);

      const orderData = {
        bondId: selectedBond,
        orderType,
        orderSubType: priceType,
        quantity: parseInt(quantity),
        price: priceType === 'limit' ? parseFloat(price) : undefined,
        timeInForce: 'GTC'
      };

      const response = await ordersAPI.placeOrder(orderData);
      
      if (response.data.success) {
        toast.success('Order placed successfully!');
        
        // Reset form
        setQuantity('');
        if (priceType === 'limit') {
          setPrice(bondData.currentPrice.toString());
        }
        
        // Refresh data
        await Promise.all([
          fetchBondData(selectedBond),
          fetchOrderBook(selectedBond),
          refreshUserData()
        ]);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const maxQuantity = orderType === 'buy' 
    ? Math.min(
        Math.floor(user?.wallet?.balance / (priceType === 'market' ? bondData?.currentPrice || 1 : parseFloat(price) || 1)),
        bondData?.availableTokens || 0
      )
    : 1000; // For sell orders, this would come from user's holdings

  const orderValue = quantity && bondData 
    ? parseInt(quantity) * (priceType === 'limit' ? parseFloat(price || 0) : bondData.currentPrice)
    : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading && !bondData) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>Trading</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

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
        <Box>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Select Bond</InputLabel>
            <Select
              value={selectedBond}
              label="Select Bond"
              onChange={(e) => handleBondChange(e.target.value)}
              size="small"
            >
              {availableBonds.map((bond) => (
                <MenuItem key={bond.bondId} value={bond.bondId}>
                  {bond.symbol} - {bond.name.substring(0, 20)}...
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Refresh />}>
            Refresh Data
          </Button>
        </Box>
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
                    {bondData?.symbol?.substring(0, 2) || 'NA'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {bondData?.name || 'Loading...'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {bondData?.symbol} • {bondData?.couponRate}% • {bondData?.rating?.value}
                    </Typography>
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h5" fontWeight="bold">
                    {bondData ? formatCurrency(bondData.currentPrice) : '---'}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    {bondData?.priceChange?.percentage >= 0 ? (
                      <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    ) : (
                      <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                    )}
                    <Typography
                      color={bondData?.priceChange?.percentage >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="medium"
                    >
                      {bondData?.priceChange?.percentage >= 0 ? '+' : ''}{bondData?.priceChange?.percentage?.toFixed(2) || '0.00'}%
                      ({bondData?.priceChange?.percentage >= 0 ? '+' : ''}{formatCurrency(bondData?.priceChange?.absolute || 0)})
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">Day High</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {bondData ? formatCurrency(bondData.currentPrice * 1.02) : '---'}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">Day Low</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {bondData ? formatCurrency(bondData.currentPrice * 0.98) : '---'}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">Volume</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {bondData?.volume?.today?.toLocaleString() || '0'}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">Yield</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {bondData?.currentYield?.toFixed(2) || '0.00'}%
                  </Typography>
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
                  <LineChart data={priceChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Price']} />
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
              
              {user?.kycStatus !== 'verified' && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    KYC verification required for orders above ₹10,000
                  </Typography>
                </Alert>
              )}
              
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
                  inputProps={{ min: 1, max: maxQuantity }}
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
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                )}

                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Order Value: {formatCurrency(orderValue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Balance: {formatCurrency(user?.wallet?.balance || 0)}
                  </Typography>
                  {orderType === 'buy' && orderValue > (user?.wallet?.balance || 0) && (
                    <Typography variant="body2" color="error.main">
                      Insufficient balance
                    </Typography>
                  )}
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color={orderType === 'buy' ? 'success' : 'error'}
                  disabled={!quantity || (priceType === 'limit' && !price) || submitting}
                  size="large"
                >
                  {submitting 
                    ? 'Placing Order...' 
                    : `${orderType === 'buy' ? 'Buy' : 'Sell'} ${bondData?.symbol || ''}`
                  }
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
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderBook.asks.slice(0, 8).reverse().map((ask, index) => (
                          <TableRow key={index} sx={{ bgcolor: 'rgba(244, 67, 54, 0.05)' }}>
                            <TableCell>{formatCurrency(ask.price)}</TableCell>
                            <TableCell align="right">{ask.remainingQuantity}</TableCell>
                          </TableRow>
                        ))}
                        {orderBook.asks.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} align="center">
                              <Typography variant="body2" color="text.secondary">
                                No sell orders
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Spread */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip
                      label={orderBook.asks[0] && orderBook.bids[0] 
                        ? `Spread: ${formatCurrency(orderBook.asks[0].price - orderBook.bids[0].price)}`
                        : 'No spread data'
                      }
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
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderBook.bids.slice(0, 8).map((bid, index) => (
                          <TableRow key={index} sx={{ bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
                            <TableCell>{formatCurrency(bid.price)}</TableCell>
                            <TableCell align="right">{bid.remainingQuantity}</TableCell>
                          </TableRow>
                        ))}
                        {orderBook.bids.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} align="center">
                              <Typography variant="body2" color="text.secondary">
                                No buy orders
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
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
                    <TableCell>
                      {new Date(trade.executedAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(trade.price)}</TableCell>
                    <TableCell align="right">{trade.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(trade.price * trade.quantity)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={trade.transactionType?.toUpperCase() || 'TRADE'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {recentTrades.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" py={2}>
                        No recent trades available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Order Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Warning color="warning" sx={{ mr: 1 }} />
            Confirm Order
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please review your order details:
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography><strong>Bond:</strong> {bondData?.name}</Typography>
            <Typography><strong>Type:</strong> {orderType.toUpperCase()} {priceType.toUpperCase()}</Typography>
            <Typography><strong>Quantity:</strong> {quantity}</Typography>
            <Typography><strong>Price:</strong> {priceType === 'market' ? 'Market Price' : formatCurrency(parseFloat(price))}</Typography>
            <Typography><strong>Total Value:</strong> {formatCurrency(orderValue)}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone. Are you sure you want to place this order?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmOrder} 
            variant="contained" 
            color={orderType === 'buy' ? 'success' : 'error'}
            disabled={submitting}
          >
            {submitting ? 'Placing...' : 'Confirm Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Trading;
