import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade,
  Paper,
} from '@mui/material';
import {
  LoginOutlined,
  PersonAddOutlined,
  PlayArrow,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  TrendingUp,
  Security,
  Speed,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  
  const { login, register, demoLogin, loading } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
    setFocusedField('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (tabValue === 1 && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (tabValue === 1) {
      // Additional validation for registration
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (tabValue === 0) {
      await login(formData.email, formData.password);
    } else {
      await register(formData.name, formData.email, formData.password);
    }
  };

  const handleDemoLogin = async () => {
    await demoLogin();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <LoadingSpinner message="Authenticating..." />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Animation */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
          `,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      />

      <Card 
        sx={{ 
          maxWidth: 450, 
          width: '100%',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Paper 
              elevation={0}
              sx={{ 
                display: 'inline-flex',
                p: 1,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                mb: 2
              }}
            >
              <TrendingUp sx={{ color: 'white', fontSize: 40 }} />
            </Paper>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              sx={{
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              SangamBonds
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Corporate Bond Trading Platform
            </Typography>
            
            {/* Features */}
            <Box display="flex" justifyContent="space-around" mb={2}>
              <Box textAlign="center">
                <Security color="primary" sx={{ fontSize: 24, mb: 0.5 }} />
                <Typography variant="caption" display="block">Secure</Typography>
              </Box>
              <Box textAlign="center">
                <Speed color="primary" sx={{ fontSize: 24, mb: 0.5 }} />
                <Typography variant="caption" display="block">Fast</Typography>
              </Box>
              <Box textAlign="center">
                <TrendingUp color="primary" sx={{ fontSize: 24, mb: 0.5 }} />
                <Typography variant="caption" display="block">Profitable</Typography>
              </Box>
            </Box>
          </Box>

          {/* Demo Login Button */}
          <Fade in timeout={1000}>
            <Button
              fullWidth
              variant="outlined"
              color="success"
              startIcon={<PlayArrow />}
              onClick={handleDemoLogin}
              sx={{ 
                mb: 2,
                py: 1.5,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                }
              }}
              disabled={loading}
            >
              Try Demo Login (Instant Access)
            </Button>
          </Fade>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or continue with email
            </Typography>
          </Divider>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab 
              icon={<LoginOutlined />} 
              label="Login" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              icon={<PersonAddOutlined />} 
              label="Register" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>

          {/* Demo Credentials Alert */}
          {tabValue === 0 && (
            <Fade in timeout={500}>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem'
                  }
                }}
              >
                <Typography variant="body2">
                  <strong>Demo Credentials:</strong><br />
                  Email: demo@sangambonds.com<br />
                  Password: demo123
                </Typography>
              </Alert>
            </Fade>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {tabValue === 1 && (
              <Fade in timeout={300}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('')}
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{ mb: 2 }}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color={focusedField === 'name' ? 'primary' : 'inherit'} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Fade>
            )}

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color={focusedField === 'email' ? 'primary' : 'inherit'} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              error={!!errors.password}
              helperText={errors.password}
              sx={{ mb: 3 }}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color={focusedField === 'password' ? 'primary' : 'inherit'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                tabValue === 0 ? 'Sign In to Your Account' : 'Create Your Account'
              )}
            </Button>
          </Box>

          {/* Additional Info */}
          <Box textAlign="center" mt={3}>
            <Typography variant="caption" color="text.secondary">
              By {tabValue === 0 ? 'signing in' : 'creating an account'}, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
