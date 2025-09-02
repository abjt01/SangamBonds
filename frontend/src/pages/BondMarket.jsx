import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  LinearProgress,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Search,
  FilterList,
  TrendingUp,
  TrendingDown,
  Star,
  StarBorder,
  ShoppingCart,
  Info,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BondMarket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [sortBy, setSortBy] = useState('yield');
  const [watchlist, setWatchlist] = useState(['HDFC001', 'TATA001']);

  // Mock bond data - replace with real API data
  const [bonds] = useState([
    {
      bondId: 'HDFC001',
      name: 'HDFC Bank Ltd',
      issuer: 'HDFC Bank Limited',
      symbol: 'HDFCBANK',
      currentPrice: 1025.50,
      faceValue: 1000,
      couponRate: 6.8,
      maturityDate: '2030-06-15',
      rating: { value: 'AAA', agency: 'CRISIL' },
      sector: 'Banking & Financial Services',
      riskLevel: 'Low',
      currentYield: 6.63,
      yieldToMaturity: 6.45,
      minInvestment: 1000,
      availableTokens: 95000,
      totalTokens: 150000,
      volume: { today: 2500 },
      priceChange: { absolute: 15.50, percentage: 1.54 },
      lastTradedPrice: 1010.00,
    },
    {
      bondId: 'TATA001',
      name: 'Tata Motors Ltd',
      issuer: 'Tata Motors Limited',
      symbol: 'TATAMOTORS',
      currentPrice: 1070.29,
      faceValue: 1000,
      couponRate: 7.5,
      maturityDate: '2028-12-31',
      rating: { value: 'AA', agency: 'CRISIL' },
      sector: 'Automotive',
      riskLevel: 'Medium',
      currentYield: 7.01,
      yieldToMaturity: 6.85,
      minInvestment: 1000,
      availableTokens: 75000,
      totalTokens: 100000,
      volume: { today: 1800 },
      priceChange: { absolute: -8.25, percentage: -0.76 },
      lastTradedPrice: 1078.54,
    },
    {
      bondId: 'RIL001',
      name: 'Reliance Industries Ltd',
      issuer: 'Reliance Industries Limited',
      symbol: 'RELIANCE',
      currentPrice: 985.75,
      faceValue: 1000,
      couponRate: 6.5,
      maturityDate: '2029-03-20',
      rating: { value: 'AA+', agency: 'CRISIL' },
      sector: 'Oil & Gas',
      riskLevel: 'Medium',
      currentYield: 6.59,
      yieldToMaturity: 6.72,
      minInvestment: 1000,
      availableTokens: 120000,
      totalTokens: 200000,
      volume: { today: 3200 },
      priceChange: { absolute: 22.15, percentage: 2.30 },
      lastTradedPrice: 963.60,
    },
    {
      bondId: 'ITC001',
      name: 'ITC Limited',
      issuer: 'ITC Limited',
      symbol: 'ITC',
      currentPrice: 1015.20,
      faceValue: 1000,
      couponRate: 6.0,
      maturityDate: '2027-08-10',
      rating: { value: 'AA+', agency: 'ICRA' },
      sector: 'FMCG',
      riskLevel: 'Low',
      currentYield: 5.91,
      yieldToMaturity: 5.85,
      minInvestment: 1000,
      availableTokens: 88000,
      totalTokens: 125000,
      volume: { today: 1650 },
      priceChange: { absolute: 5.80, percentage: 0.58 },
      lastTradedPrice: 1009.40,
    },
  ]);

  const sectors = ['All', 'Banking & Financial Services', 'Automotive', 'Oil & Gas', 'FMCG', 'Infrastructure', 'Power & Utilities'];
  const ratings = ['All', 'AAA', 'AA+', 'AA', 'AA-', 'A+', 'A'];

  const filteredBonds = bonds.filter(bond => {
    const matchesSearch = bond.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bond.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'All' || bond.sector === sectorFilter;
    const matchesRating = ratingFilter === 'All' || bond.rating.value === ratingFilter;
    
    return matchesSearch && matchesSector && matchesRating;
  });

  const toggleWatchlist = (bondId) => {
    setWatchlist(prev => 
      prev.includes(bondId) 
        ? prev.filter(id => id !== bondId)
        : [...prev, bondId]
    );
  };

  const handleBuyClick = (bond) => {
    navigate(`/trading/${bond.bondId}`);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Bond Market 📈
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover and invest in corporate bonds
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => setLoading(true)}>
          Refresh Data
        </Button>
      </Box>

      {/* Market Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">156</Typography>
              <Typography variant="body2" color="text.secondary">Active Bonds</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">₹2.5Cr</Typography>
              <Typography variant="body2" color="text.secondary">Today's Volume</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">6.45%</Typography>
              <Typography variant="body2" color="text.secondary">Avg Yield</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">78%</Typography>
              <Typography variant="body2" color="text.secondary">AA+ Rated</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search bonds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sector</InputLabel>
                <Select
                  value={sectorFilter}
                  label="Sector"
                  onChange={(e) => setSectorFilter(e.target.value)}
                >
                  {sectors.map(sector => (
                    <MenuItem key={sector} value={sector}>{sector}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Rating</InputLabel>
                <Select
                  value={ratingFilter}
                  label="Rating"
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  {ratings.map(rating => (
                    <MenuItem key={rating} value={rating}>{rating}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="yield">Yield</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="volume">Volume</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <IconButton>
                <FilterList />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bond Listings */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Bonds ({filteredBonds.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bond</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Change</TableCell>
                  <TableCell align="right">Current Yield</TableCell>
                  <TableCell align="right">YTM</TableCell>
                  <TableCell align="center">Rating</TableCell>
                  <TableCell align="center">Risk</TableCell>
                  <TableCell align="right">Volume</TableCell>
                  <TableCell align="right">Available</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBonds.map((bond) => (
                  <TableRow key={bond.bondId} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.light' }}>
                          {bond.symbol.substring(0, 2)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {bond.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bond.symbol} • {bond.couponRate}% • {bond.maturityDate.split('-')[0]}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        ₹{bond.currentPrice.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Face: ₹{bond.faceValue}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        {bond.priceChange.percentage >= 0 ? (
                          <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                        ) : (
                          <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                        )}
                        <Typography
                          variant="body2"
                          color={bond.priceChange.percentage >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="medium"
                        >
                          {bond.priceChange.percentage >= 0 ? '+' : ''}{bond.priceChange.percentage.toFixed(2)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        ₹{Math.abs(bond.priceChange.absolute).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {bond.currentYield.toFixed(2)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {bond.yieldToMaturity.toFixed(2)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={bond.rating.value}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={bond.riskLevel}
                        size="small"
                        color={getRiskColor(bond.riskLevel)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {bond.volume.today.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <Typography variant="body2">
                          {bond.availableTokens.toLocaleString()}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(1 - bond.availableTokens / bond.totalTokens) * 100}
                          sx={{ width: 60, height: 4, mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1}>
                        <Tooltip title={watchlist.includes(bond.bondId) ? "Remove from watchlist" : "Add to watchlist"}>
                          <IconButton
                            size="small"
                            onClick={() => toggleWatchlist(bond.bondId)}
                          >
                            {watchlist.includes(bond.bondId) ? (
                              <Star sx={{ color: 'warning.main' }} />
                            ) : (
                              <StarBorder />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View details">
                          <IconButton size="small">
                            <Info />
                          </IconButton>
                        </Tooltip>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<ShoppingCart />}
                          onClick={() => handleBuyClick(bond)}
                        >
                          Buy
                        </Button>
                      </Box>
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

export default BondMarket;
