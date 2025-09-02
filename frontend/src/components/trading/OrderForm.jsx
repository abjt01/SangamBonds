import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Chip,
  Divider,
  InputAdornment,
  FormHelperText,
  Paper,
  CircularProgress
} from '@mui/material';
import { ShoppingCart, TrendingUp, TrendingDown, AccountBalance } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const OrderForm = ({ bond, onOrderPlaced, selectedPrice }) => {
  const { user, executeOrder } = useAuth(); // Use executeOrder from context
  
  // Form state
  const [orderType, setOrderType] = useState('buy');
  const [orderSubType, setOrderSubType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [timeInForce, setTimeInForce] = useState('GTC');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderValue, setOrderValue] = useState(0);
  const [fees, setFees] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Set price when selected from order book
  useEffect(() => {
    if (selectedPrice && orderSubType === 'limit') {
      setPrice(selectedPrice.toString());
    }
  }, [selectedPrice, orderSubType]);

  // Calculate order value and fees
  useEffect(() => {
    if (quantity && (orderSubType === 'market' || price)) {
      const qty = parseInt(quantity) || 0;
      const orderPrice = orderSubType === 'market' ? bond?.currentPrice || 0 : parseFloat(price) || 0;
      const value = qty * orderPrice;
      const calculatedFees = value * 0.002; // 0.2% total fees
      
      setOrderValue(value);
      setFees(calculatedFees);
      setTotalCost(value + (orderType === 'buy' ? calculatedFees : 0));
    } else {
      setOrderValue(0);
      setFees(0);
      setTotalCost(0);
    }
  }, [quantity, price, orderType, orderSubType, bond?.currentPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!bond) {
      setError('No bond selected');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (orderSubType === 'limit' && (!price || parseFloat(price) <= 0)) {
      setError('Please enter a valid price');
      return;
    }

    // Check balance for buy orders
    if (orderType === 'buy' && user?.wallet?.balance < totalCost) {
      setError(`Insufficient balance. Required: ₹${totalCost.toLocaleString()}, Available: ₹${user.wallet.balance.toLocaleString()}`);
      return;
    }

    try {
      setLoading(true);

      // REAL ORDER EXECUTION
      const orderData = {
        orderType,
        orderSubType,
        quantity: parseInt(quantity),
        price: orderSubType === 'market' ? bond.currentPrice : parseFloat(price),
        bondId: bond.bondId,
        bondName: bond.name,
        bondSymbol: bond.symbol
      };

      const result = await executeOrder(orderData);

      if (result.success) {
        toast.success(`${orderType.toUpperCase()} order executed successfully! New balance: ₹${result.newBalance.toLocaleString()}`);
        
        // Reset form
        setQuantity('');
        setPrice('');
        setOrderValue(0);
        setFees(0);
        setTotalCost(0);
        
        // Notify parent component
        if (onOrderPlaced) {
          onOrderPlaced({
            orderId: result.orderId,
            orderType,
            orderSubType,
            quantity: parseInt(quantity),
            price: result.executedPrice,
            totalValue: result.executedQuantity * result.executedPrice,
            status: 'filled'
          });
        }
      }
    } catch (error) {
      const message = error.message || 'Failed to place order';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!bond) {
    return (
      <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Alert severity="info">
            Please select a bond to place an order
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalBondValue = bond.totalTokens * bond.currentPrice;
  const bondValueInLakhs = totalBondValue / 100000;

  return (
    <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AccountBalance color="primary" />
          <Typography variant="h6" sx={{ color: '#000000 !important', fontWeight: 700 }}>
            Place Order
          </Typography>
        </Box>

        {/* Bond Fragment Information */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#f0fdf4', border: '2px solid #22c55e' }}>
          <Typography variant="h6" sx={{ color: '#000000 !important', fontWeight: 700, mb: 1 }}>
            {bond.name} ({bond.symbol})
          </Typography>
          <Typography variant="body1" sx={{ color: '#15803d !important', fontWeight: 600, mb: 2 }}>
            🧩 Fragment of ₹{bondValueInLakhs.toFixed(1)} Lakh {bond.name} Bond
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, border: '1px solid #dcfce7' }}>
                <Typography variant="caption" sx={{ color: '#374151 !important', fontWeight: 600 }}>
                  TOTAL BOND VALUE
                </Typography>
                <Typography variant="h6" sx={{ color: '#000000 !important', fontWeight: 700 }}>
                  ₹{bondValueInLakhs.toFixed(1)} Lakh
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, border: '1px solid #dcfce7' }}>
                <Typography variant="caption" sx={{ color: '#374151 !important', fontWeight: 600 }}>
                  PRICE PER FRAGMENT
                </Typography>
                <Typography variant="h6" sx={{ color: '#3b82f6 !important', fontWeight: 700 }}>
                  {formatCurrency(bond.currentPrice)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              💡 Instead of buying the entire ₹{bondValueInLakhs.toFixed(1)} Lakh bond, you can buy individual fragments starting from just {formatCurrency(bond.currentPrice)}!
            </Typography>
          </Alert>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Order Type */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#374151 !important', fontWeight: 500 }}>Order Type</InputLabel>
                <Select
                  value={orderType}
                  label="Order Type"
                  onChange={(e) => setOrderType(e.target.value)}
                  sx={{ '& .MuiSelect-select': { color: '#000000 !important', fontWeight: 500 } }}
                >
                  <MenuItem value="buy">
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUp color="success" fontSize="small" />
                      <Typography sx={{ color: '#000000 !important', fontWeight: 500 }}>Buy Fragments</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="sell">
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingDown color="error" fontSize="small" />
                      <Typography sx={{ color: '#000000 !important', fontWeight: 500 }}>Sell Fragments</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Order Sub Type */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#374151 !important', fontWeight: 500 }}>Order Type</InputLabel>
                <Select
                  value={orderSubType}
                  label="Order Type"
                  onChange={(e) => setOrderSubType(e.target.value)}
                  sx={{ '& .MuiSelect-select': { color: '#000000 !important', fontWeight: 500 } }}
                >
                  <MenuItem value="market">
                    <Typography sx={{ color: '#000000 !important', fontWeight: 500 }}>Market Order</Typography>
                  </MenuItem>
                  <MenuItem value="limit">
                    <Typography sx={{ color: '#000000 !important', fontWeight: 500 }}>Limit Order</Typography>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Quantity */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Number of Fragments to Buy"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                InputProps={{
                  inputProps: { min: 1, max: bond.availableTokens }
                }}
                helperText={`Available: ${bond.availableTokens?.toLocaleString()} fragments | Min: 1 fragment`}
                sx={{
                  '& .MuiInputLabel-root': { color: '#374151 !important', fontWeight: 500 },
                  '& .MuiOutlinedInput-input': { color: '#000000 !important', fontWeight: 600, fontSize: '16px' }
                }}
              />
            </Grid>

            {/* Price (only for limit orders) */}
            {orderSubType === 'limit' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Price per Fragment"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    inputProps: { min: 0.01, step: 0.01 }
                  }}
                  helperText={selectedPrice ? `Selected from order book: ₹${selectedPrice}` : `Current market price: ${formatCurrency(bond.currentPrice)}`}
                  sx={{
                    '& .MuiInputLabel-root': { color: '#374151 !important', fontWeight: 500 },
                    '& .MuiOutlinedInput-input': { color: '#000000 !important', fontWeight: 600, fontSize: '16px' }
                  }}
                />
              </Grid>
            )}
          </Grid>

          {/* Order Summary */}
          {orderValue > 0 && (
            <Paper sx={{ mt: 3, p: 3, bgcolor: '#eff6ff', border: '2px solid #3b82f6' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#000000 !important', fontWeight: 700 }}>
                📊 Order Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                    Fragments:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" sx={{ color: '#000000 !important', fontWeight: 700 }}>
                    {quantity} fragments
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                    Price per Fragment:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" sx={{ color: '#000000 !important', fontWeight: 700 }}>
                    {formatCurrency(orderSubType === 'market' ? bond.currentPrice : parseFloat(price) || 0)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                    Order Value:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" sx={{ color: '#000000 !important', fontWeight: 700 }}>
                    {formatCurrency(orderValue)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                    Trading Fees (0.2%):
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" sx={{ color: '#000000 !important', fontWeight: 700 }}>
                    {formatCurrency(fees)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ color: '#000000 !important', fontWeight: 700 }}>
                    Total {orderType === 'buy' ? 'Amount to Pay' : 'Amount to Receive'}:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" align="right" sx={{ color: '#3b82f6 !important', fontWeight: 700 }}>
                    {formatCurrency(orderType === 'buy' ? totalCost : orderValue - fees)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Balance Info */}
          <Paper sx={{ mt: 3, p: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
              💰 Available Balance: 
              <Typography component="span" sx={{ color: '#000000 !important', fontWeight: 700, ml: 1 }}>
                {formatCurrency(user?.wallet?.balance || 0)}
              </Typography>
            </Typography>
            {orderType === 'buy' && totalCost > 0 && (
              <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500, mt: 1 }}>
                💳 Balance After Order: 
                <Typography component="span" sx={{ color: totalCost <= (user?.wallet?.balance || 0) ? '#10b981' : '#ef4444', fontWeight: 700, ml: 1 }}>
                  {formatCurrency((user?.wallet?.balance || 0) - totalCost)}
                </Typography>
              </Typography>
            )}
          </Paper>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <ShoppingCart />}
            sx={{ 
              mt: 3,
              py: 2.5,
              bgcolor: orderType === 'buy' ? '#10b981' : '#ef4444',
              '&:hover': {
                bgcolor: orderType === 'buy' ? '#059669' : '#dc2626'
              },
              '&:disabled': {
                bgcolor: '#94a3b8',
              },
              fontWeight: 700,
              fontSize: '18px',
              textTransform: 'none'
            }}
            disabled={!quantity || (orderSubType === 'limit' && !price) || loading}
          >
            {loading ? 'Executing Order...' : `${orderType === 'buy' ? 'Buy' : 'Sell'} ${quantity || 0} Fragment${quantity > 1 ? 's' : ''} NOW`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
