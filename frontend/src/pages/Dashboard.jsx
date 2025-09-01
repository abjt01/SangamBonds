import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';

const Dashboard = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Portfolio Value</Typography>
              <Typography variant="h4" color="primary">₹50,000</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total P&L</Typography>
              <Typography variant="h4" color="success.main">+₹5,000</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
