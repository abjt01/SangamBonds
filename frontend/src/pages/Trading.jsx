import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Skeleton,
  Paper,
  Container
} from '@mui/material';
import { 
  ArrowBack, 
  Refresh, 
  TrendingUp, 
  TrendingDown, 
  Cancel,
  ShoppingCart
} from '@mui/icons-material';
import { bondsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import OrderBook from '../components/trading/OrderBook';
import OrderForm from '../components/trading/OrderForm';
import TradingChart from '../components/trading/TradingChart';
import toast from 'react-hot-toast';

const Trading = () => {
  const { bondId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [bond, setBond] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Orders and trades
  const [userOrders, setUserOrders] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (bondId) {
      fetchBondDetails();
      fetchUserOrders();
      fetchRecentTrades();
    }
  }, [bondId]);

  const fetchBondDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock bond data for now
      const mockBond = {
        bondId: bondId,
        name: `SangamBond ${bondId}`,
        symbol: `SB${bondId}`,
        sector: 'Banking & Financial Services',
        currentPrice: 1025.50 + (Math.random() - 0.5) * 50,
        priceChange: {
          absolute: 15.50 + (Math.random() - 0.5) * 30,
          percentage: 1.54 + (Math.random() - 0.5) * 3
        },
        currentYield: 6.63,
        availableTokens: 95000,
        totalTokens: 150000,
        rating: { value: 'AAA', agency: 'CRISIL' },
        couponRate: 6.8,
        volume: { today: 2500 }
      };
      
      setBond(mockBond);
    } catch (error) {
      console.error('Error fetching bond details:', error);
      setError('Failed to load bond details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true);
      // Mock orders data
      const mockOrders = [
        {
          orderId: 'ORD001',
          orderType: 'buy',
          quantity: 100,
          price: 1020,
          totalValue: 102000,
          status: 'open',
          placedAt: new Date(),
          filledQuantity: 0
        },
        {
          orderId: 'ORD002',
          orderType: 'sell',
          quantity: 50,
          price: 1030,
          totalValue: 51500,
          status: 'partial',
          placedAt: new Date(Date.now() - 3600000),
          filledQuantity: 25
        }
      ];
      
      setUserOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchRecentTrades = async () => {
    try {
      // Mock recent trades
      const mockTrades = [
        { price: 1025.50, quantity: 100, totalValue: 102550, executedAt: new Date() },
        { price: 1024.75, quantity: 200, totalValue: 204950, executedAt: new Date(Date.now() - 300000) },
        { price: 1026.00, quantity: 150, totalValue: 153900, executedAt: new Date(Date.now() - 600000) }
      ];
      
      setRecentTrades(mockTrades);
    } catch (error) {
      console.error('Error fetching recent trades:', error);
    }
  };

  const handleOrderPlaced = (orderData) => {
    fetchUserOrders();
    fetchBondDetails();
    toast.success('Order placed successfully!');
  };

  const handleCancelOrder = async (orderId) => {
    try {
      toast.success('Order cancelled successfully');
      fetchUserOrders();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'filled': return 'success';
      case 'partial': return 'warning';
      case 'open': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Skeleton height={60} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Skeleton height={300} sx={{ mb: 2 }} />
            <Skeleton height={400} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton height={500} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !bond) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Bond not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/market')}
        >
          Back to Market
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            onClick={() => navigate('/market')}
            sx={{ bgcolor: 'white', boxShadow: 1 }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
              {bond.name}
            </Typography>
            <Typography variant="h6" sx={{ color: '#374151 !important' }}>
              {bond.symbol} • {bond.sector}
            </Typography>
          </Box>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={fetchBondDetails}
          variant="outlined"
          sx={{ bgcolor: 'white' }}
        >
          Refresh
        </Button>
      </Box>

      {/* Bond Summary */}
      <Card sx={{ mb: 3, bgcolor: 'white', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={4}>
            <Grid item xs={6} md={3}>
              <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                Current Price
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
                {formatCurrency(bond.currentPrice)}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                {bond.priceChange?.absolute >= 0 ? 
                  <TrendingUp color="success" fontSize="small" /> :
                  <TrendingDown color="error" fontSize="small" />
                }
                <Typography 
                  variant="body1" 
                  fontWeight="medium"
                  sx={{ 
                    color: bond.priceChange?.absolute >= 0 ? '#15803d !important' : '#dc2626 !important'
                  }}
                >
                  {bond.priceChange?.absolute >= 0 ? '+' : ''}
                  {bond.priceChange?.absolute?.toFixed(2)} 
                  ({bond.priceChange?.percentage?.toFixed(2)}%)
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                Current Yield
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
                {bond.currentYield?.toFixed(2)}%
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                Available Fragments
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
                {bond.availableTokens?.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#374151 !important' }}>
                of {bond.totalTokens?.toLocaleString()}
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                Rating
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
                {bond.rating?.value}
              </Typography>
              <Typography variant="body2" sx={{ color: '#374151 !important' }}>
                by {bond.rating?.agency}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Panel - Chart and Orders */}
        <Grid item xs={12} lg={8}>
          {/* Trading Chart */}
          <Card sx={{ mb: 3, bgcolor: 'white', boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <TradingChart bondId={bondId} />
            </CardContent>
          </Card>

          {/* Orders and Trades Tabs */}
          <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f9fafb' }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                <Tab 
                  label="My Orders" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#000000 !important',
                    '&.Mui-selected': { color: '#3b82f6 !important' }
                  }}
                />
                <Tab 
                  label="Recent Trades"
                  sx={{ 
                    fontWeight: 600,
                    color: '#000000 !important',
                    '&.Mui-selected': { color: '#3b82f6 !important' }
                  }}
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <CardContent sx={{ p: 3 }}>
              {activeTab === 0 ? (
                // My Orders Tab
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ color: '#000000 !important', fontWeight: 700 }}>
                      My Orders
                    </Typography>
                    <Button
                      startIcon={<Refresh />}
                      onClick={fetchUserOrders}
                      size="small"
                      variant="outlined"
                    >
                      Refresh
                    </Button>
                  </Box>

                  {ordersLoading ? (
                    [...Array(3)].map((_, i) => (
                      <Skeleton key={i} height={60} sx={{ mb: 1 }} />
                    ))
                  ) : userOrders.length === 0 ? (
                    <Alert severity="info">
                      You have no orders for this bond
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#000000 !important' }}>Type</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Quantity</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Price</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Total</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: '#000000 !important' }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: '#000000 !important' }}>Time</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: '#000000 !important' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {userOrders.map((order) => (
                            <TableRow key={order.orderId} hover>
                              <TableCell>
                                <Chip
                                  label={order.orderType.toUpperCase()}
                                  size="small"
                                  color={order.orderType === 'buy' ? 'success' : 'error'}
                                  variant="filled"
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#000000 !important', fontWeight: 500 }}>
                                {order.filledQuantity > 0 && (
                                  <Typography variant="body2" sx={{ color: '#374151 !important' }}>
                                    {order.filledQuantity}/
                                  </Typography>
                                )}
                                {order.quantity.toLocaleString()}
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#000000 !important', fontWeight: 500 }}>
                                {formatCurrency(order.price)}
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#000000 !important', fontWeight: 500 }}>
                                {formatCurrency(order.totalValue)}
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={order.status.toUpperCase()}
                                  size="small"
                                  color={getStatusColor(order.status)}
                                  variant="filled"
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" sx={{ color: '#000000 !important' }}>
                                  {formatDateTime(order.placedAt)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {['open', 'partial'].includes(order.status) && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCancelOrder(order.orderId)}
                                    color="error"
                                  >
                                    <Cancel />
                                  </IconButton>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              ) : (
                // Recent Trades Tab
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: '#000000 !important', fontWeight: 700 }}>
                    Recent Trades
                  </Typography>

                  {recentTrades.length === 0 ? (
                    <Alert severity="info">
                      No recent trades for this bond
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Price</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Quantity</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Value</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: '#000000 !important' }}>Time</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentTrades.map((trade, index) => (
                            <TableRow key={index} hover>
                              <TableCell align="right" sx={{ color: '#000000 !important', fontWeight: 500 }}>
                                {formatCurrency(trade.price)}
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#000000 !important', fontWeight: 500 }}>
                                {trade.quantity.toLocaleString()}
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#000000 !important', fontWeight: 500 }}>
                                {formatCurrency(trade.totalValue)}
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" sx={{ color: '#000000 !important' }}>
                                  {formatDateTime(trade.executedAt)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Order Book and Order Form */}
        <Grid item xs={12} lg={4}>
          {/* Order Book */}
          <Box mb={3}>
            <OrderBook
              bondId={bondId}
              onPriceSelect={setSelectedPrice}
            />
          </Box>

          {/* Order Form */}
          <OrderForm
            bond={bond}
            onOrderPlaced={handleOrderPlaced}
            selectedPrice={selectedPrice}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Trading;
