import React, { useState, useEffect, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  LinearProgress,
  Tooltip,
  Pagination,
  Skeleton,
  InputAdornment,
  Paper
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
  Sort,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { bondsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

const BondMarket = () => {
  const navigate = useNavigate();

  const [bonds, setBonds] = useState([]);
  const [marketStats, setMarketStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('bondWatchlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setPage(1);
      fetchBonds({ 
        search: searchValue, 
        sector: sectorFilter, 
        rating: ratingFilter, 
        riskLevel: riskFilter, 
        sortBy, 
        sortOrder, 
        page: 1 
      });
    }, 500),
    [sectorFilter, ratingFilter, riskFilter, sortBy, sortOrder]
  );

  const fetchBonds = async (params = {}) => {
    try {
      setLoading(true);
      
      // Mock bonds data with more realistic data
      const mockBonds = [
        {
          bondId: 'HDFC001',
          name: 'HDFC Bank Ltd',
          symbol: 'HDFCBANK',
          sector: 'Banking & Financial Services',
          currentPrice: 1025.50,
          currentYield: 6.63,
          rating: { value: 'AAA', agency: 'CRISIL' },
          riskLevel: 'Low',
          availableTokens: 95000,
          totalTokens: 150000,
          volume: { today: 2500 },
          priceChange: { absolute: 15.50, percentage: 1.54 },
          marketCap: 15375000
        },
        {
          bondId: 'TATA001',
          name: 'Tata Motors Ltd',
          symbol: 'TATAMOTORS',
          sector: 'Automotive',
          currentPrice: 1070.29,
          currentYield: 7.01,
          rating: { value: 'AA+', agency: 'CRISIL' },
          riskLevel: 'Medium',
          availableTokens: 75000,
          totalTokens: 100000,
          volume: { today: 1800 },
          priceChange: { absolute: -8.25, percentage: -0.76 },
          marketCap: 10702900
        },
        {
          bondId: 'RIL001',
          name: 'Reliance Industries Ltd',
          symbol: 'RELIANCE',
          sector: 'Oil & Gas',
          currentPrice: 985.75,
          currentYield: 6.59,
          rating: { value: 'AA+', agency: 'CRISIL' },
          riskLevel: 'Medium',
          availableTokens: 120000,
          totalTokens: 200000,
          volume: { today: 3200 },
          priceChange: { absolute: 22.15, percentage: 2.30 },
          marketCap: 19715000
        }
      ];

      setBonds(mockBonds);
      setTotalPages(1);
      setTotalItems(mockBonds.length);
      
      setMarketStats({
        totalBonds: mockBonds.length,
        avgYield: 6.74,
        totalVolume: 7500,
        totalMarketCap: 45792900
      });
      
    } catch (error) {
      console.error('Error fetching bonds:', error);
      toast.error('Failed to load bonds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonds();
  }, [page, sectorFilter, ratingFilter, riskFilter, sortBy, sortOrder]);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBonds();
    setRefreshing(false);
    toast.success('Market data refreshed');
  };

  const toggleWatchlist = (bondId) => {
    const newWatchlist = watchlist.includes(bondId)
      ? watchlist.filter(id => id !== bondId)
      : [...watchlist, bondId];
    
    setWatchlist(newWatchlist);
    localStorage.setItem('bondWatchlist', JSON.stringify(newWatchlist));
    toast.success(watchlist.includes(bondId) ? 'Removed from watchlist' : 'Added to watchlist');
  };

  const handleBuyClick = (bond) => {
    navigate(`/trading/${bond.bondId}`);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const sectors = ['All', 'Banking & Financial Services', 'Automotive', 'Oil & Gas', 'FMCG', 'Infrastructure', 'Power & Utilities', 'Telecommunications', 'Real Estate', 'Pharmaceuticals', 'IT Services', 'Metals & Mining'];
  const ratings = ['All', 'AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB'];
  const riskLevels = ['All', 'Low', 'Medium', 'High'];

  return (
    <Box p={3} sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* CORRECTED Header with High Contrast */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h3" fontWeight="bold" sx={{ color: '#000000 !important', mb: 1 }}>
            Bond Market
          </Typography>
          <Typography variant="h6" sx={{ color: '#374151 !important' }}>
            Discover and invest in corporate bonds
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
          variant="contained"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Market Stats */}
      {marketStats && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
                  {marketStats.totalBonds}
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                  Total Bonds
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
                  {marketStats.avgYield.toFixed(2)}%
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                  Avg Yield
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
                  {marketStats.totalVolume.toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                  Total Volume
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#000000 !important' }}>
                  {formatCurrency(marketStats.totalMarketCap)}
                </Typography>
                <Typography variant="body1" sx={{ color: '#374151 !important', fontWeight: 500 }}>
                  Market Cap
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3, bgcolor: 'white', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search bonds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#374151' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputLabel-root': { color: '#374151 !important', fontWeight: 500 },
                  '& .MuiOutlinedInput-input': { color: '#000000 !important', fontWeight: 500 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sector</InputLabel>
                <Select
                  value={sectorFilter}
                  label="Sector"
                  onChange={(e) => setSectorFilter(e.target.value)}
                >
                  {sectors.map((sector) => (
                    <MenuItem key={sector} value={sector}>
                      <Typography sx={{ color: '#000000 !important', fontWeight: 500 }}>
                        {sector}
                      </Typography>
                    </MenuItem>
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
                  {ratings.map((rating) => (
                    <MenuItem key={rating} value={rating}>
                      <Typography sx={{ color: '#000000 !important', fontWeight: 500 }}>
                        {rating}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={riskFilter}
                  label="Risk Level"
                  onChange={(e) => setRiskFilter(e.target.value)}
                >
                  {riskLevels.map((risk) => (
                    <MenuItem key={risk} value={risk}>
                      <Typography sx={{ color: '#000000 !important', fontWeight: 500 }}>
                        {risk}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bond Listings */}
      <Card sx={{ bgcolor: 'white', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ color: '#000000 !important', fontWeight: 700 }}>
              Available Bonds ({totalItems})
            </Typography>
            <Box display="flex" gap={1}>
              <Chip 
                icon={<Sort />} 
                label={`Sort: ${sortBy} (${sortOrder.toUpperCase()})`} 
                variant="outlined" 
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>

          {loading ? (
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} height={80} sx={{ mb: 2 }} />
            ))
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#000000 !important' }}>Bond</TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ cursor: 'pointer', fontWeight: 700, color: '#000000 !important' }} 
                      onClick={() => handleSortChange('currentPrice')}
                    >
                      Price {sortBy === 'currentPrice' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Change</TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ cursor: 'pointer', fontWeight: 700, color: '#000000 !important' }} 
                      onClick={() => handleSortChange('currentYield')}
                    >
                      Yield {sortBy === 'currentYield' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#000000 !important' }}>Rating</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#000000 !important' }}>Risk</TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ cursor: 'pointer', fontWeight: 700, color: '#000000 !important' }} 
                      onClick={() => handleSortChange('volume.today')}
                    >
                      Volume {sortBy === 'volume.today' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#000000 !important' }}>Available</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#000000 !important' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bonds.map((bond) => (
                    <TableRow key={bond.bondId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            {bond.symbol?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="medium" sx={{ color: '#000000 !important' }}>
                              {bond.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#374151 !important' }}>
                              {bond.symbol} • {bond.sector}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="medium" sx={{ color: '#000000 !important' }}>
                          {formatCurrency(bond.currentPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          {bond.priceChange?.absolute >= 0 ? 
                            <TrendingUp color="success" fontSize="small" /> :
                            <TrendingDown color="error" fontSize="small" />
                          }
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: bond.priceChange?.absolute >= 0 ? '#15803d !important' : '#dc2626 !important',
                              fontWeight: 600
                            }}
                          >
                            {bond.priceChange?.absolute >= 0 ? '+' : ''}
                            {bond.priceChange?.absolute?.toFixed(2)} 
                            ({bond.priceChange?.percentage?.toFixed(2)}%)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="medium" sx={{ color: '#000000 !important' }}>
                          {bond.currentYield?.toFixed(2)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={bond.rating?.value} 
                          size="small" 
                          color="primary" 
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={bond.riskLevel} 
                          size="small" 
                          color={getRiskColor(bond.riskLevel)} 
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: '#000000 !important', fontWeight: 500 }}>
                          {bond.volume?.today?.toLocaleString() || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2" sx={{ color: '#000000 !important', fontWeight: 500 }}>
                            {bond.availableTokens?.toLocaleString() || 0}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={bond.totalTokens ? (1 - (bond.availableTokens / bond.totalTokens)) * 100 : 0}
                            sx={{ width: 60, height: 4, mt: 0.5 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title={watchlist.includes(bond.bondId) ? 'Remove from watchlist' : 'Add to watchlist'}>
                            <IconButton
                              size="small"
                              onClick={() => toggleWatchlist(bond.bondId)}
                            >
                              {watchlist.includes(bond.bondId) ? 
                                <Star sx={{ color: '#f59e0b' }} /> : 
                                <StarBorder />
                              }
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="View details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/bonds/${bond.bondId}`)}
                            >
                              <Info />
                            </IconButton>
                          </Tooltip>

                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ShoppingCart />}
                            onClick={() => handleBuyClick(bond)}
                            disabled={!bond.availableTokens || bond.availableTokens === 0}
                            sx={{ fontWeight: 600 }}
                          >
                            Buy
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!loading && bonds.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body2" sx={{ color: '#374151 !important', py: 4 }}>
                          No bonds found matching your criteria. Try adjusting your filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BondMarket;
