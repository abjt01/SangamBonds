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

  const sectors = [
    'All', 'Banking & Financial Services', 'Automotive', 'Oil & Gas', 
    'FMCG', 'Infrastructure', 'Power & Utilities', 'Telecommunications',
    'Real Estate', 'Pharmaceuticals', 'IT Services', 'Metals & Mining'
  ];
  
  const ratings = ['All', 'AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB'];
  const riskLevels = ['All', 'Low', 'Medium', 'High'];

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
      const queryParams = {
        search: searchTerm,
        sector: sectorFilter !== 'All' ? sectorFilter : undefined,
        rating: ratingFilter !== 'All' ? ratingFilter : undefined,
        riskLevel: riskFilter !== 'All' ? riskFilter : undefined,
        sortBy,
        sortOrder,
        page,
        limit: 20,
        ...params
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await bondsAPI.getAllBonds(queryParams);
      
      if (response.data.success) {
        setBonds(response.data.data.bonds);
        setMarketStats(response.data.data.marketStats);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalItems(response.data.data.pagination.totalItems);
      }
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
    
    toast.success(
      watchlist.includes(bondId) 
        ? 'Removed from watchlist' 
        : 'Added to watchlist'
    );
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

  const StatCard = ({ title, value, color = "primary", isLoading = false }) => (
    <Card>
      <CardContent sx={{ textAlign: 'center' }}>
        {isLoading ? (
          <>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="80%" height={20} />
          </>
        ) : (
          <>
            <Typography variant="h6" color={color}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
          </>
        )}
      </CardContent>
    </Card>
  );

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
        <Button 
          variant="outlined" 
          startIcon={<Refresh />} 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      {/* Market Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Bonds"
            value={marketStats?.totalBonds || 0}
            color="primary"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Volume"
            value={marketStats ? formatCurrency(marketStats.totalVolume) : formatCurrency(0)}
            color="success.main"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Yield"
            value={marketStats ? `${marketStats.avgYield.toFixed(2)}%` : '0.00%'}
            color="warning.main"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Market Cap"
            value={marketStats ? formatCurrency(marketStats.totalMarketCap) : formatCurrency(0)}
            color="info.main"
            isLoading={loading}
          />
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
            <Grid item xs={12} md={2}>
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
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={riskFilter}
                  label="Risk Level"
                  onChange={(e) => setRiskFilter(e.target.value)}
                >
                  {riskLevels.map(risk => (
                    <MenuItem key={risk} value={risk}>{risk}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSectorFilter('All');
                  setRatingFilter('All');
                  setRiskFilter('All');
                  setSearchTerm('');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bond Listings */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Available Bonds ({totalItems})
            </Typography>
            <Box display="flex" gap={1}>
              <Chip 
                icon={<Sort />}
                label={`Sort: ${sortBy} ${sortOrder === 'asc' ? '↑' : '↓'}`}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bond</TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSortChange('currentPrice')}
                  >
                    Price {sortBy === 'currentPrice' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell align="right">Change</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSortChange('currentYield')}
                  >
                    Yield {sortBy === 'currentYield' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell align="center">Rating</TableCell>
                  <TableCell align="center">Risk</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSortChange('volume.today')}
                  >
                    Volume {sortBy === 'volume.today' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell align="right">Available</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                          <Box>
                            <Skeleton variant="text" width={150} height={20} />
                            <Skeleton variant="text" width={100} height={16} />
                          </Box>
                        </Box>
                      </TableCell>
                      {Array.from({ length: 8 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton variant="text" width="100%" height={20} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  bonds.map((bond) => (
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
                              {bond.symbol} • {bond.couponRate}% • {new Date(bond.maturityDate).getFullYear()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(bond.currentPrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Face: {formatCurrency(bond.faceValue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          {bond.priceChange?.percentage >= 0 ? (
                            <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                          ) : (
                            <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                          )}
                          <Typography
                            variant="body2"
                            color={bond.priceChange?.percentage >= 0 ? 'success.main' : 'error.main'}
                            fontWeight="medium"
                          >
                            {bond.priceChange?.percentage >= 0 ? '+' : ''}{bond.priceChange?.percentage?.toFixed(2) || '0.00'}%
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(Math.abs(bond.priceChange?.absolute || 0))}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {bond.currentYield?.toFixed(2) || '0.00'}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={bond.rating?.value || 'N/A'}
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
                          {bond.volume?.today?.toLocaleString() || '0'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2">
                            {bond.availableTokens?.toLocaleString() || '0'}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={bond.totalTokens ? (1 - bond.availableTokens / bond.totalTokens) * 100 : 0}
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
                          >
                            Buy
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!loading && bonds.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="text.secondary" py={4}>
                        No bonds found matching your criteria. Try adjusting your filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
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
