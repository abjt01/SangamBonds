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
} from '@mui/material';
import { LoginOutlined, PersonAddOutlined, PlayArrow } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  
  const { login, register, demoLogin, loading } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
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
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              SangamBonds
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Corporate Bond Trading Platform
            </Typography>
          </Box>

          {/* Demo Login Button */}
          <Button
            fullWidth
            variant="outlined"
            color="success"
            startIcon={<PlayArrow />}
            onClick={handleDemoLogin}
            sx={{ mb: 2 }}
            disabled={loading}
          >
            Try Demo Login
          </Button>

          <Divider sx={{ my: 2 }}>or</Divider>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab icon={<LoginOutlined />} label="Login" />
            <Tab icon={<PersonAddOutlined />} label="Register" />
          </Tabs>

          {/* Demo Credentials Alert */}
          {tabValue === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Demo:</strong> demo@sangambonds.com / demo123
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {tabValue === 1 && (
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                sx={{ mb: 2 }}
                disabled={loading}
              />
            )}

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
            >
              {tabValue === 0 ? 'Login' : 'Register'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
