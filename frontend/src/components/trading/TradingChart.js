import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Info,
  ShowChart,
  Assessment,
  BookmarkBorder,
  Share,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Components
import OrderBook from '../components/Trading/OrderBook';
import TradingChart from '../components/Trading/TradingChart';
import OrderForm from '../components/Trading/OrderForm';
import RecentTrades from '../components/Trading/RecentTrades';
import PositionsSummary from '../components/Trading/PositionsSummary';
import MarketDepth from '../components/Trading/MarketDepth';

const TradingContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f8fafc',
  minHeight: 'calc(100vh - 64px)',
}));

const PriceCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  marginBottom: theme.spacing(2),
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
}));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trading-tabpanel-${index}`}
      aria-labelledby={`trading-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const Trading = () => {
  const { bondId } = useParams();
  const [orderType, setOrderType] = useState('buy');
  const [tabValue, setTabValue] = useState(0);
  const [selectedBond, setSelectedBond] = useState({
    id: 'TATA001',
    name: 'Tata Motors Ltd',
    symbol: 'TATAMOTORS',
    currentPrice: 1070.29,
    change: 12.45,
    changePercent: 1.18,
    volume: '2.5M',
    high: 1085.50,
    low: 1052.30,
    open: 1058.75,
    prevClose: 1057.84,
    marketCap: '₹1,07,029 Cr',
    yield: '7.12%',
    maturity: '2028-12-31',
    rating: 'AA',
    sector: 'Automotive',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatPrice = (price) => `₹${price.toFixed(2)}`;
  const formatChange = (change, percent) => {
    const isPositive = change >= 0;
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        {isPositive ? (
          <TrendingUp sx={{ fontSize: 16, color: '#22c55e' }} />
        ) : (
          <TrendingDown sx={{ fontSize: 16, color: '#ef4444' }} />
        )}
        <Typography
          variant="body2"
          sx={{
            color: isPositive ? '#22c55e' : '#ef4444',
            fontWeight: 600,
          }}
        >
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{percent.toFixed(2)}%)
        </Typography>
      </Box>
    );
  };

  return (
    <TradingContainer>
      {/* Header Section */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {selectedBond.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6" color="text.secondary">
                {selectedBond.symbol}
              </Typography>
              <Chip 
                label={selectedBond.rating} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label={selectedBond.sector} 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Add to Watchlist">
              <IconButton><BookmarkBorder /></IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton><Share /></IconButton>
            </Tooltip>
            <Tooltip title="Bond Info">
              <IconButton><Info /></IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Price Section */}
        <PriceCard>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="h3" fontWeight="bold">
                  {formatPrice(selectedBond.currentPrice)}
                </Typography>
                {formatChange(selectedBond.change, selectedBond.changePercent)}
              </Grid>
              <Grid item xs={12} md={9}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>OPEN</Typography>
                    <Typography variant="body1" fontWeight="600">
                      {formatPrice(selectedBond.open)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>HIGH</Typography>
                    <Typography variant="body1" fontWeight="600" color="#22c55e">
                      {formatPrice(selectedBond.high)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>LOW</Typography>
                    <Typography variant="body1" fontWeight="600" color="#ef4444">
                      {formatPrice(selectedBond.low)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>VOLUME</Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedBond.volume}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </PriceCard>

        {/* Quick Stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Typography variant="caption" color="text.secondary">MARKET CAP</Typography>
              <Typography variant="h6" fontWeight="600">{selectedBond.marketCap}</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Typography variant="caption" color="text.secondary">YIELD</Typography>
              <Typography variant="h6" fontWeight="600" color="success.main">
                {selectedBond.yield}
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Typography variant="caption" color="text.secondary">MATURITY</Typography>
              <Typography variant="h6" fontWeight="600">
                {new Date(selectedBond.maturity).getFullYear()}
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard>
              <Typography variant="caption" color="text.secondary">PREV CLOSE</Typography>
              <Typography variant="h6" fontWeight="600">
                {formatPrice(selectedBond.prevClose)}
              </Typography>
            </StatsCard>
          </Grid>
        </Grid>
      </Box>

      {/* Main Trading Interface */}
      <Grid container spacing={2}>
        {/* Left Column - Chart and Tabs */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 0, mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ px: 2, borderBottom: '1px solid #e2e8f0' }}
            >
              <Tab icon={<ShowChart />} label="Chart" />
              <Tab icon={<Assessment />} label="Market Depth" />
              <Tab label="Recent Trades" />
              <Tab label="Analytics" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <TradingChart bondId={selectedBond.id} height={400} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <MarketDepth bondId={selectedBond.id} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <RecentTrades bondId={selectedBond.id} />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>Bond Analytics</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption">Duration</Typography>
                    <Typography variant="h6">4.2 years</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">Modified Duration</Typography>
                    <Typography variant="h6">4.0 years</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">Convexity</Typography>
                    <Typography variant="h6">18.5</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">Credit Spread</Typography>
                    <Typography variant="h6">150 bps</Typography>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
          </Paper>

          {/* Positions Summary */}
          <PositionsSummary />
        </Grid>

        {/* Right Column - Order Book and Trading */}
        <Grid item xs={12} lg={4}>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Order Form */}
            <OrderForm 
              bondId={selectedBond.id}
              currentPrice={selectedBond.currentPrice}
              onOrderSubmit={(order) => console.log('Order submitted:', order)}
            />

            {/* Order Book */}
            <OrderBook 
              bondId={selectedBond.id}
              lastPrice={selectedBond.currentPrice}
            />
          </Box>
        </Grid>
      </Grid>
    </TradingContainer>
  );
};

export default Trading;