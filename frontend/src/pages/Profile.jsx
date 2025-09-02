import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Verified,
  Warning,
  Security,
  Notifications,
  Palette,
  Language,
  Upload,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    dateOfBirth: user?.profile?.dateOfBirth || '',
    address: {
      street: user?.profile?.address?.street || '',
      city: user?.profile?.address?.city || '',
      state: user?.profile?.address?.state || '',
      zipCode: user?.profile?.address?.zipCode || '',
    },
  });
  const [preferences, setPreferences] = useState({
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      sms: user?.preferences?.notifications?.sms ?? false,
      push: user?.preferences?.notifications?.push ?? true,
    },
    language: user?.preferences?.language || 'en',
    theme: user?.preferences?.theme || 'light',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePreferenceChange = (category, setting, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSave = () => {
    // Update user data
    updateUser({
      ...formData,
      preferences
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.profile?.phone || '',
      dateOfBirth: user?.profile?.dateOfBirth || '',
      address: {
        street: user?.profile?.address?.street || '',
        city: user?.profile?.address?.city || '',
        state: user?.profile?.address?.state || '',
        zipCode: user?.profile?.address?.zipCode || '',
      },
    });
    setEditing(false);
  };

  const getKycStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'submitted': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getKycStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <Verified />;
      case 'submitted': return <Warning />;
      case 'rejected': return <Error />;
      default: return <Warning />;
    }
  };

  const tradingLevel = user?.trading?.level || 'Beginner';
  const tradingPoints = user?.trading?.points || 0;
  const nextLevelPoints = {
    'Beginner': 1000,
    'Intermediate': 5000,
    'Advanced': 10000,
    'Expert': 999999
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Profile Settings 👤
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>
        <Box>
          {editing ? (
            <>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Profile Info */}
        <Grid item xs={12} md={8}>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 2 }}
                  src={user?.profile?.avatar}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {new Date(user?.createdAt).getFullYear()}
                  </Typography>
                  <IconButton size="small" disabled={!editing}>
                    <PhotoCamera />
                  </IconButton>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!editing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.email}
                      onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                      disabled={!editing}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.sms}
                      onChange={(e) => handlePreferenceChange('notifications', 'sms', e.target.checked)}
                      disabled={!editing}
                    />
                  }
                  label="SMS Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.push}
                      onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
                      disabled={!editing}
                    />
                  }
                  label="Push Notifications"
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={preferences.language}
                      label="Language"
                      onChange={(e) => handlePreferenceChange('language', null, e.target.value)}
                      disabled={!editing}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="hi">हिंदी</MenuItem>
                      <MenuItem value="te">తెలుగు</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={preferences.theme}
                      label="Theme"
                      onChange={(e) => handlePreferenceChange('theme', null, e.target.value)}
                      disabled={!editing}
                    >
                      <MenuItem value="light">Light Mode</MenuItem>
                      <MenuItem value="dark">Dark Mode</MenuItem>
                      <MenuItem value="auto">Auto</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Status Cards */}
        <Grid item xs={12} md={4}>
          {/* KYC Status */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">KYC Status</Typography>
                <Chip
                  icon={getKycStatusIcon(user?.kycStatus)}
                  label={user?.kycStatus?.toUpperCase() || 'PENDING'}
                  color={getKycStatusColor(user?.kycStatus)}
                  variant="outlined"
                />
              </Box>
              
              {user?.kycStatus !== 'verified' && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Complete KYC to unlock full trading features
                </Alert>
              )}
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setKycDialogOpen(true)}
                disabled={user?.kycStatus === 'verified'}
              >
                {user?.kycStatus === 'verified' ? 'Verified' : 'Upload Documents'}
              </Button>
            </CardContent>
          </Card>

          {/* Trading Level */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Trading Level</Typography>
              
              <Box textAlign="center" mb={2}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {tradingLevel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tradingPoints.toLocaleString()} points
                </Typography>
              </Box>
              
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Progress to next level
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(tradingPoints / nextLevelPoints[tradingLevel]) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {nextLevelPoints[tradingLevel] - tradingPoints} points to {
                    tradingLevel === 'Beginner' ? 'Intermediate' :
                    tradingLevel === 'Intermediate' ? 'Advanced' :
                    tradingLevel === 'Advanced' ? 'Expert' : 'Max Level'
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Account Summary */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Account Summary</Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Total Trades"
                    secondary={user?.trading?.totalTrades || 0}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Account Balance"
                    secondary={`₹${user?.wallet?.balance?.toLocaleString('en-IN') || '0'}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Login"
                    secondary={new Date(user?.lastLogin).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Member Since"
                    secondary={new Date(user?.createdAt).toLocaleDateString()}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* KYC Upload Dialog */}
      <Dialog open={kycDialogOpen} onClose={() => setKycDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload KYC Documents</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Please upload the following documents for verification:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="PAN Card"
                secondary="Clear photo of your PAN card"
              />
              <Button size="small" variant="outlined">Upload</Button>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Aadhaar Card"
                secondary="Front and back photos"
              />
              <Button size="small" variant="outlined">Upload</Button>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Bank Statement"
                secondary="Last 3 months statement"
              />
              <Button size="small" variant="outlined">Upload</Button>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKycDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Submit for Review</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
