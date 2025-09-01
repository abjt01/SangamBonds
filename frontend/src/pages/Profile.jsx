import React from 'react';
import { Box, Typography } from '@mui/material';

const Profile = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1">
        User profile settings.
      </Typography>
    </Box>
  );
};

export default Profile;
