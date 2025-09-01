import React from 'react';
import { Box, Typography } from '@mui/material';

const BondMarket = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Bond Market
      </Typography>
      <Typography variant="body1">
        Bond market data will be displayed here.
      </Typography>
    </Box>
  );
};

export default BondMarket;
