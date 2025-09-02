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
  Snackbar,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Verified,
  Warning,
  Upload,
  CheckCircle,
  Error,
  CloudUpload,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
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

  const [kycDocuments, setKycDocuments] = useState({
    panCard: null,
    aadharCard: null,
    bankStatement: null,
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email');
      return false;
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        name: formData.name,
        profile: {
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
        },
        preferences
      };

      const result = await updateUser(updateData);
      
      if (result.success) {
        setEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
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

  const handleFileUpload = (documentType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload only JPEG, PNG, or PDF files');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('File size must be less than 5MB');
      return;
    }

    setKycDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));

    toast.success(`${documentType} uploaded successfully`);
  };

  const handleKycSubmit = async () => {
    if (!kycDocuments.panCard || !kycDocuments.aadharCard) {
      toast.error('Please upload PAN Card and Aadhaar Card');
      return;
    }

    try {
      setUploading(true);
      
      // In a real application, you would upload the files to a server
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('KYC documents submitted for review');
      setKycDialogOpen(false);
      setKycDocuments({
        panCard: null,
        aadharCard: null,
        bankStatement: null,
      });
      
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast.error('Failed to submit KYC documents');
    } finally {
      setUploading(false);
    }
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
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
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
                <Box flexGrow={1}>
                  <Typography variant="h6">{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
                  </Typography>
                </Box>
                <IconButton 
                  component="label" 
                  disabled={!editing}
                  sx={{ 
                    bgcolor: 'primary.light', 
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                >
                  <PhotoCamera />
                  <input type="file" hidden accept="image/*" />
                </IconButton>
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
                    error={editing && !formData.name.trim()}
                    helperText={editing && !formData.name.trim() ? 'Name is required' : ''}
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
                    disabled={true} // Email should not be editable
                    helperText="Contact support to change email"
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
                    placeholder="+91 XXXXX XXXXX"
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

          {/* Preferences */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
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
                  Complete KYC to unlock full trading features and higher limits.
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
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress to next level
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((tradingPoints / nextLevelPoints[tradingLevel]) * 100, 100)}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {nextLevelPoints[tradingLevel] === 999999 
                    ? 'Maximum level reached!' 
                    : `${(nextLevelPoints[tradingLevel] - tradingPoints).toLocaleString()} points to ${
                        tradingLevel === 'Beginner' ? 'Intermediate' :
                        tradingLevel === 'Intermediate' ? 'Advanced' : 'Expert'
                      }`
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
                    secondary={new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR'
                    }).format(user?.wallet?.balance || 0)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Login"
                    secondary={user?.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Member Since"
                    secondary={new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* KYC Upload Dialog */}
      <Dialog 
        open={kycDialogOpen} 
        onClose={() => !uploading && setKycDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Upload KYC Documents</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Please upload the following documents for verification:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                {kycDocuments.panCard ? <CheckCircle color="success" /> : <Warning color="warning" />}
              </ListItemIcon>
              <ListItemText
                primary="PAN Card"
                secondary="Clear photo of your PAN card (JPEG, PNG, or PDF)"
              />
              <Button 
                component="label" 
                size="small" 
                variant="outlined"
                startIcon={kycDocuments.panCard ? <CheckCircle /> : <CloudUpload />}
                disabled={uploading}
              >
                {kycDocuments.panCard ? 'Uploaded' : 'Upload'}
                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload('panCard', e)}
                />
              </Button>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                {kycDocuments.aadharCard ? <CheckCircle color="success" /> : <Warning color="warning" />}
              </ListItemIcon>
              <ListItemText
                primary="Aadhaar Card"
                secondary="Front and back photos (JPEG, PNG, or PDF)"
              />
              <Button 
                component="label" 
                size="small" 
                variant="outlined"
                startIcon={kycDocuments.aadharCard ? <CheckCircle /> : <CloudUpload />}
                disabled={uploading}
              >
                {kycDocuments.aadharCard ? 'Uploaded' : 'Upload'}
                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload('aadharCard', e)}
                />
              </Button>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                {kycDocuments.bankStatement ? <CheckCircle color="success" /> : <Warning color="disabled" />}
              </ListItemIcon>
              <ListItemText
                primary="Bank Statement (Optional)"
                secondary="Last 3 months statement (PDF preferred)"
              />
              <Button 
                component="label" 
                size="small" 
                variant="outlined"
                startIcon={kycDocuments.bankStatement ? <CheckCircle /> : <CloudUpload />}
                disabled={uploading}
              >
                {kycDocuments.bankStatement ? 'Uploaded' : 'Upload'}
                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload('bankStatement', e)}
                />
              </Button>
            </ListItem>
          </List>

          {(kycDocuments.panCard || kycDocuments.aadharCard || kycDocuments.bankStatement) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Documents will be verified within 24-48 hours. You'll receive an email notification once verification is complete.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setKycDialogOpen(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleKycSubmit} 
            variant="contained"
            disabled={!kycDocuments.panCard || !kycDocuments.aadharCard || uploading}
          >
            {uploading ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
