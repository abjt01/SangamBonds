import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  Chip,
  LinearProgress,
  Paper
} from '@mui/material';

const OrderBook = ({ bondId, onPriceSelect }) => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [], bondId: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bondId) {
      fetchOrderBook();
    }
  }, [bondId]);

  const fetchOrderBook = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock order book data
      const mockOrderBook = {
        bondId: bondId,
        asks: [
          { price: 1030.00, remainingQuantity: 500, placedAt: new Date() },
          { price: 1029.50, remainingQuantity: 300, placedAt: new Date() },
          { price: 1029.00, remainingQuantity: 800, placedAt: new Date() },
          { price: 1028.50, remainingQuantity: 200, placedAt: new Date() },
          { price: 1028.00, remainingQuantity: 600, placedAt: new Date() }
        ],
        bids: [
          { price: 1027.50, remainingQuantity: 400, placedAt: new Date() },
          { price: 1027.00, remainingQuantity: 700, placedAt: new Date() },
          { price: 1026.50, remainingQuantity: 300, placedAt: new Date() },
          { price: 1026.00, remainingQuantity: 900, placedAt: new Date() },
          { price: 1025.50, remainingQuantity: 250, placedAt: new Date() }
        ],
        timestamp: new Date()
      };
      
      setOrderBook(mockOrderBook);
    } catch (error) {
      console.error('Error fetching order book:', error);
      setError('Failed to load order book');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceClick = (price) => {
    if (onPriceSelect) {
      onPriceSelect(price);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatQuantity = (qty) => {
    return new Intl.NumberFormat('en-IN').format(qty);
  };

  if (loading) {
    return (
      <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#000000 !important', fontWeight: 700 }}>
            Order Book
          </Typography>
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} height={40} sx={{ mb: 1 }} />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  const maxQuantity = Math.max(
    ...orderBook.bids.map(b => b.remainingQuantity),
    ...orderBook.asks.map(a => a.remainingQuantity),
    1
  );

  return (
    <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ color: '#000000 !important', fontWeight: 700 }}>
            Order Book
          </Typography>
          <Chip 
            label="Live" 
            color="success" 
            size="small" 
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: 600, boxShadow: 1 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 700, 
                    bgcolor: '#f9fafb', 
                    color: '#000000 !important',
                    fontSize: '13px'
                  }}
                >
                  Quantity
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 700, 
                    bgcolor: '#f9fafb', 
                    color: '#000000 !important',
                    fontSize: '13px'
                  }}
                >
                  Price (₹)
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 700, 
                    bgcolor: '#f9fafb', 
                    color: '#000000 !important',
                    fontSize: '13px'
                  }}
                >
                  Total (₹)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Sell Orders (Asks) - Higher prices at top */}
              {orderBook.asks
                .slice()
                .reverse()
                .map((ask, index) => (
                  <TableRow 
                    key={`ask-${index}`}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        bgcolor: '#fef2f2 !important' 
                      }
                    }}
                    onClick={() => handlePriceClick(ask.price)}
                  >
                    <TableCell align="center" sx={{ position: 'relative', p: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(ask.remainingQuantity / maxQuantity) * 100}
                        sx={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: 0,
                          bottom: 0,
                          height: '100%',
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'rgba(239, 68, 68, 0.2)'
                          }
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          position: 'relative', 
                          zIndex: 1, 
                          color: '#dc2626 !important',
                          fontWeight: 600,
                          fontSize: '13px'
                        }}
                      >
                        {formatQuantity(ask.remainingQuantity)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ p: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#dc2626 !important',
                          fontSize: '14px'
                        }}
                      >
                        {ask.price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ p: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#dc2626 !important', 
                          fontSize: '12px',
                          fontWeight: 500
                        }}
                      >
                        {formatQuantity(ask.remainingQuantity * ask.price)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}

              {/* Spread Row */}
              {orderBook.bids.length > 0 && orderBook.asks.length > 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ bgcolor: '#f3f4f6', py: 1 }}>
                    <Typography variant="caption" sx={{ color: '#374151 !important', fontWeight: 600 }}>
                      Spread: ₹{(orderBook.asks?.price - orderBook.bids?.price).toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {/* Buy Orders (Bids) - Higher prices at top */}
              {orderBook.bids.map((bid, index) => (
                <TableRow 
                  key={`bid-${index}`}
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      bgcolor: '#f0fdf4 !important' 
                    }
                  }}
                  onClick={() => handlePriceClick(bid.price)}
                >
                  <TableCell align="center" sx={{ position: 'relative', p: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(bid.remainingQuantity / maxQuantity) * 100}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        height: '100%',
                        bgcolor: 'rgba(34, 197, 94, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'rgba(34, 197, 94, 0.2)'
                        }
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        position: 'relative', 
                        zIndex: 1, 
                        color: '#15803d !important',
                        fontWeight: 600,
                        fontSize: '13px'
                      }}
                    >
                      {formatQuantity(bid.remainingQuantity)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ p: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#15803d !important',
                        fontSize: '14px'
                      }}
                    >
                      {bid.price.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ p: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#15803d !important', 
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {formatQuantity(bid.remainingQuantity * bid.price)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}

              {/* Empty state */}
              {orderBook.bids.length === 0 && orderBook.asks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#374151 !important' }}>
                      No orders in the book
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Order Book Statistics */}
        <Box mt={3} display="flex" justifyContent="space-around" sx={{ bgcolor: '#f9fafb', p: 2, borderRadius: 2 }}>
          <Box textAlign="center">
            <Typography variant="caption" sx={{ color: '#374151 !important', fontWeight: 600 }}>
              Buy Orders
            </Typography>
            <Typography variant="h6" sx={{ color: '#15803d !important', fontWeight: 700 }}>
              {orderBook.bids.length}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" sx={{ color: '#374151 !important', fontWeight: 600 }}>
              Sell Orders
            </Typography>
            <Typography variant="h6" sx={{ color: '#dc2626 !important', fontWeight: 700 }}>
              {orderBook.asks.length}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" sx={{ color: '#374151 !important', fontWeight: 600 }}>
              Total Volume
            </Typography>
            <Typography variant="h6" sx={{ color: '#000000 !important', fontWeight: 700 }}>
              {formatQuantity(
                [...orderBook.bids, ...orderBook.asks]
                  .reduce((sum, order) => sum + order.remainingQuantity, 0)
              )}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderBook;
