import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
} from '@mui/material';
import numeral from 'numeral';

const OrderBookContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: '#1e293b',
  color: '#ffffff',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  minHeight: '500px',
}));

const OrderBookHeader = styled(Typography)(({ theme }) => ({
  color: '#94a3b8',
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  textAlign: 'center',
}));

const BidRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  cursor: 'pointer',
}));

const AskRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  cursor: 'pointer',
}));

const BidCell = styled(TableCell)(({ theme }) => ({
  color: '#22c55e',
  fontSize: '12px',
  padding: '4px 8px',
  border: 'none',
  fontFamily: 'monospace',
}));

const AskCell = styled(TableCell)(({ theme }) => ({
  color: '#ef4444',
  fontSize: '12px',
  padding: '4px 8px',
  border: 'none',
  fontFamily: 'monospace',
}));

const NeutralCell = styled(TableCell)(({ theme }) => ({
  color: '#94a3b8',
  fontSize: '12px',
  padding: '4px 8px',
  border: 'none',
  fontFamily: 'monospace',
}));

const LastPriceContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#0f172a',
  padding: theme.spacing(2),
  margin: `${theme.spacing(2)} 0`,
  borderRadius: theme.spacing(1),
  textAlign: 'center',
  border: '1px solid #334155',
}));

const LastPriceValue = styled(Typography)(({ theme }) => ({
  color: '#22c55e',
  fontSize: '24px',
  fontWeight: 700,
  fontFamily: 'monospace',
}));

const LastPriceLabel = styled(Typography)(({ theme }) => ({
  color: '#64748b',
  fontSize: '12px',
  marginTop: theme.spacing(0.5),
}));

const HeaderCell = styled(TableCell)(({ theme }) => ({
  color: '#64748b',
  fontSize: '10px',
  fontWeight: 600,
  padding: '8px',
  border: 'none',
  textTransform: 'uppercase',
}));

const OrderBook = ({ bondId = 'TATA001', lastPrice = 1070.29 }) => {
  // Mock order book data (in real app, this would come from WebSocket)
  const orderBookData = {
    bids: [
      { total: 10.68570, amount: 0.01000, price: 1068.18 },
      { total: 476.50640, amount: 0.53521, price: 1068.21 },
      { total: 53.41800, amount: 0.05000, price: 1068.36 },
      { total: 6410.520, amount: 6.0000, price: 1068.42 },
      { total: 10.99425, amount: 0.01029, price: 1068.44 },
      { total: 8086.639, amount: 7.56850, price: 1068.46 },
      { total: 6590.1713, amount: 6.16786, price: 1068.47 },
      { total: 1245.5040, amount: 1.40000, price: 1068.48 },
      { total: 12822.360, amount: 12.000, price: 1068.53 },
      { total: 496.50640, amount: 0.46465, price: 1068.56 },
      { total: 10.68570, amount: 0.01000, price: 1068.57 },
    ],
    asks: [
      { total: 1729.457, amount: 1.61645, price: 1069.99 },
      { total: 2100.315, amount: 1.96304, price: 1069.97 },
      { total: 9892.6254, amount: 9.24579, price: 1069.96 },
      { total: 32098.50, amount: 30.00000, price: 1069.95 },
      { total: 2100.315, amount: 1.96304, price: 1069.93 },
      { total: 6686.811, amount: 6.25000, price: 1068.89 },
      { total: 1729.4057, amount: 1.61645, price: 1069.88 },
      { total: 7537.331, amount: 7.04620, price: 1069.70 },
      { total: 33583.13, amount: 31.40287, price: 1069.43 },
      { total: 19.997222, amount: 0.01870, price: 1069.37 },
      { total: 2673.250, amount: 2.50000, price: 1069.30 },
    ]
  };

  const formatNumber = (num, decimals = 5) => {
    return numeral(num).format(`0.${'0'.repeat(decimals)}`);
  };

  const formatPrice = (price) => {
    return numeral(price).format('0.00');
  };

  return (
    <OrderBookContainer elevation={0}>
      <OrderBookHeader variant="h6">
        Order Book
      </OrderBookHeader>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <HeaderCell align="left">Total</HeaderCell>
              <HeaderCell align="center">Amount</HeaderCell>
              <HeaderCell align="right">Price</HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Asks (Sell Orders) - Reverse order to show highest first */}
            {orderBookData.asks.reverse().map((ask, index) => (
              <AskRow key={`ask-${index}`}>
                <AskCell align="left">{formatNumber(ask.total, 2)}</AskCell>
                <NeutralCell align="center">{formatNumber(ask.amount)}</NeutralCell>
                <AskCell align="right">{formatPrice(ask.price)}</AskCell>
              </AskRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Last Market Price */}
      <LastPriceContainer>
        <LastPriceValue>
          {formatPrice(lastPrice)}
        </LastPriceValue>
        <LastPriceLabel>
          Last Market Price
        </LastPriceLabel>
      </LastPriceContainer>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <HeaderCell align="left">Price</HeaderCell>
              <HeaderCell align="center">Amount</HeaderCell>
              <HeaderCell align="right">Total</HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Bids (Buy Orders) */}
            {orderBookData.bids.map((bid, index) => (
              <BidRow key={`bid-${index}`}>
                <BidCell align="left">{formatPrice(bid.price)}</BidCell>
                <NeutralCell align="center">{formatNumber(bid.amount)}</NeutralCell>
                <BidCell align="right">{formatNumber(bid.total, 2)}</BidCell>
              </BidRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Market Info */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #334155' }}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography sx={{ color: '#64748b', fontSize: '12px' }}>
            Spread:
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '12px', fontFamily: 'monospace' }}>
            {formatPrice(Math.min(...orderBookData.asks.map(a => a.price)) - 
                        Math.max(...orderBookData.bids.map(b => b.price)))}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography sx={{ color: '#64748b', fontSize: '12px' }}>
            Best Bid:
          </Typography>
          <Typography sx={{ color: '#22c55e', fontSize: '12px', fontFamily: 'monospace' }}>
            {formatPrice(Math.max(...orderBookData.bids.map(b => b.price)))}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography sx={{ color: '#64748b', fontSize: '12px' }}>
            Best Ask:
          </Typography>
          <Typography sx={{ color: '#ef4444', fontSize: '12px', fontFamily: 'monospace' }}>
            {formatPrice(Math.min(...orderBookData.asks.map(a => a.price)))}
          </Typography>
        </Box>
      </Box>
    </OrderBookContainer>
  );
};

export default OrderBook;