import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Refresh } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={3}
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body2">
              We're sorry for the inconvenience. Please try refreshing the page.
            </Typography>
          </Alert>
          
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={this.handleRefresh}
          >
            Refresh Page
          </Button>
          
          {process.env.NODE_ENV === 'development' && (
            <Box mt={3} maxWidth={800}>
              <Typography variant="caption" color="error">
                {this.state.error?.toString()}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
