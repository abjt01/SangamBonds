import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Slider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import numeral from 'numeral';

const OrderFormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: theme.spacing(1.5),
}));

const BuyButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#22c55e',
  color: 'white',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#16a34a',
  },
  '&:disabled': {
    backgroundColor: '#94a3b8',
  },
}));

const SellButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ef4444',
  color: 'white',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#dc2626',
  },
  '&:disabled': {
    backgroundColor: '#94a3b8',
  },
}));

const OrderTypeToggle = styled(ToggleButtonGroup)(({ theme }) => ({
  width: '100%',
  '& .MuiToggleButton-root': {
    flex: 1,
    border: '1px solid #e2e8f0',
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
}));

const StatsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `${theme.spacing(0.5)} 0`,
}));

const OrderForm = ({ bondId, currentPrice = 1070.29, onOrderSubmit }) => {
  const [orderSide, setOrderSide] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [stopPrice, setStopPrice] = useState('');
  const [errors, setErrors] = useState({});

  // Mock user data
  const userData = {
    wallet: 50000,
    availableBalance: 48500,
    holdings: {
      [bondId]: 25 // tokens
    }
  };

  const handleOrderSideChange = (event, newSide) => {
    if (newSide !== null) {
      setOrderSide(newSide);
      setErrors({});
    }
  };

  const handleOrderTypeChange = (event, newType) => {
    if (newType !== null) {
      setOrderType(newType);
      if (newType === 'market') {
        setPrice(currentPrice.toString());
      }
      setErrors({});
    }
  };

  const handleQuantityChange = (event) => {
    const value = event.target.value;
    setQuantity(value);
    calculateTotal(value, price || currentPrice);
  };

  const handlePriceChange = (event) => {
    const value = event.target.value;
    setPrice(value);
    calculateTotal(quantity, value);
  };

  const calculateTotal = (qty, prc) => {
    const q = parseFloat(qty) || 0;
    const p = parseFloat(prc) || 0;
    setTotalValue(q * p);
  };

  const validateOrder = () => {
    const newErrors = {};
    const qty = parseFloat(quantity);
    const prc = parseFloat(price || currentPrice);

    if (!quantity || qty <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (orderType !== 'market' && (!price || prc <= 0)) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (orderSide === 'buy') {
      if (totalValue > userData.availableBalance) {
        newErrors.balance = 'Insufficient balance';
      }
      if (totalValue < 1000) {
        newErrors.minimum = 'Minimum order value is ₹1,000';
      }
    } else {
      const availableTokens = userData.holdings[bondId] || 0;
      if (qty > availableTokens) {
        newErrors.holdings = 'Insufficient holdings';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateOrder()) {
      const order = {
        bondId,
        orderSide,
        orderType,
        quantity: parseFloat(quantity),
        price: orderType === 'market' ? currentPrice : parseFloat(price),
        stopPrice: stopPrice ? parseFloat(stopPrice) : null,
        totalValue,
        timestamp: new Date(),
      };
      onOrderSubmit?.(order);
      
      // Reset form
      setQuantity('');
      setPrice('');
      setStopPrice('');
      setTotalValue(0);
      setErrors({});
    }
  };

  const getMaxQuantity = () => {
    if (orderSide === 'buy') {
      const maxValue = userData.availableBalance;
      const priceToUse = parseFloat(price) || currentPrice;
      return Math.floor(maxValue / priceToUse);
    } else {
      return userData.holdings[bondId] || 0;
    }
  };

  const handleMaxClick = () => {
    const maxQty = getMaxQuantity();
    setQuantity(maxQty.toString());
    calculateTotal(maxQty, price || currentPrice);
  };

  const formatCurrency = (amount) => numeral(amount).format('0,0.00');

  return (
    <OrderFormContainer>
      <Typography variant="h6" gutterBottom fontWeight="600">
        Place Order
      </Typography>

      {/* Order Side Toggle */}
      <Box mb={3}>
        <OrderTypeToggle
          value={orderSide}
          exclusive
          onChange={handleOrderSideChange}
          aria-label="order side"
        >
          <ToggleButton value="buy" aria-label="buy">
            <TrendingUp sx={{ mr: 1, fontSize: 18 }} />
            BUY
          </ToggleButton>
          <ToggleButton value="sell" aria-label="sell">
            <TrendingDown sx={{ mr: 1, fontSize: 18 }} />
            SELL
          </ToggleButton>
        </OrderTypeToggle>
      </Box>

      {/* Order Type */}
      <Box mb={3}>
        <OrderTypeToggle
          value={orderType}
          exclusive
          onChange={handleOrderTypeChange}
          aria-label="order type"
          size="small"
        >
          <ToggleButton value="market">MARKET</ToggleButton>
          <ToggleButton value="limit">LIMIT</ToggleButton>
          <ToggleButton value="stop_loss">STOP LOSS</ToggleButton>
        </OrderTypeToggle>
      </Box>

      {/* Quantity Input */}
      <Box mb={2}>
        <TextField
          fullWidth
          label="Quantity (Tokens)"
          value={quantity}
          onChange={handleQuantityChange}
          error={!!errors.quantity}
          helperText={errors.quantity}
          type="number"
          InputProps={{
            endAdornment: (
              <Button 
                size="small" 
                onClick={handleMaxClick}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                MAX
              </Button>
            ),
          }}
        />
        <Typography variant="caption" color="text.secondary">
          Max: {getMaxQuantity().toLocaleString()} tokens
        </Typography>
      </Box>

      {/* Price Input */}
      {orderType !== 'market' && (
        <Box mb={2}>
          <TextField
            fullWidth
            label={orderType === 'stop_loss' ? 'Trigger Price (₹)' : 'Limit Price (₹)'}
            value={price}
            onChange={handlePriceChange}
            error={!!errors.price}
            helperText={errors.price}
            type="number"
            step="0.01"
          />
        </Box>
      )}

      {/* Stop Price for Stop Loss Orders */}
      {orderType === 'stop_loss' && (
        <Box mb={2}>
          <TextField
            fullWidth
            label="Stop Price (₹)"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            type="number"
            step="0.01"
          />
        </Box>
      )}

      {/* Order Summary */}
      <Box mb={3} p={2} sx={{ backgroundColor: '#f8fafc', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight="600">
          Order Summary
        </Typography>
        <StatsRow>
          <Typography variant="body2" color="text.secondary">Price:</Typography>
          <Typography variant="body2" fontWeight="500">
            ₹{formatCurrency(parseFloat(price) || currentPrice)}
          </Typography>
        </StatsRow>
        <StatsRow>
          <Typography variant="body2" color="text.secondary">Quantity:</Typography>
          <Typography variant="body2" fontWeight="500">
            {quantity || 0} tokens
          </Typography>
        </StatsRow>
        <Divider sx={{ my: 1 }} />
        <StatsRow>
          <Typography variant="body2" fontWeight="600">Total Value:</Typography>
          <Typography variant="body2" fontWeight="600" color="primary.main">
            ₹{formatCurrency(totalValue)}
          </Typography>
        </StatsRow>
        <StatsRow>
          <Typography variant="body2" color="text.secondary">Brokerage:</Typography>
          <Typography variant="body2">
            ₹{formatCurrency(totalValue * 0.001)}
          </Typography>
        </StatsRow>
        <StatsRow>
          <Typography variant="body2" color="text.secondary">GST:</Typography>
          <Typography variant="body2">
            ₹{formatCurrency(totalValue * 0.001 * 0.18)}
          </Typography>
        </StatsRow>
      </Box>

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <Box mb={2}>
          {Object.values(errors).map((error, index) => (
            <Alert severity="error" key={index} sx={{ mb: 1 }}>
              {error}
            </Alert>
          ))}
        </Box>
      )}

      {/* Available Balance/Holdings */}
      <Box mb={3} p={2} sx={{ backgroundColor: '#f1f5f9', borderRadius: 1 }}>
        {orderSide === 'buy' ? (
          <StatsRow>
            <Typography variant="body2" color="text.secondary">Available Balance:</Typography>
            <Typography variant="body2" fontWeight="600" color="success.main">
              ₹{formatCurrency(userData.availableBalance)}
            </Typography>
          </StatsRow>
        ) : (
          <StatsRow>
            <Typography variant="body2" color="text.secondary">Holdings:</Typography>
            <Typography variant="body2" fontWeight="600" color="primary.main">
              {userData.holdings[bondId] || 0} tokens
            </Typography>
          </StatsRow>
        )}
      </Box>

      {/* Submit Button */}
      {orderSide === 'buy' ? (
        <BuyButton
          fullWidth
          size="large"
          onClick={handleSubmit}
          disabled={!quantity || Object.keys(errors).length > 0}
        >
          Buy ₹{formatCurrency(totalValue)}
        </BuyButton>
      ) : (
        <SellButton
          fullWidth
          size="large"
          onClick={handleSubmit}
          disabled={!quantity || Object.keys(errors).length > 0}
        >
          Sell {quantity || 0} tokens
        </SellButton>
      )}

      {/* Market Status */}
      <Box mt={2} textAlign="center">
        <Typography variant="caption" color="success.main">
          ● Market Open - Real-time pricing
        </Typography>
      </Box>
    </OrderFormContainer>
  );
};

export default OrderForm;