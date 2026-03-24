
import React, { useState } from 'react';
import idbLogo from '../assets/idb-new-logo.webp';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  LockOutlined,
} from '@mui/icons-material';

const GeometricBackground = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      background: 'linear-gradient(135deg, #0f2035 0%, #1a3a5c 50%, #4a0f0f 100%)',
      overflow: 'hidden',
    }}
  >
    <svg
      width="50%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {/* large faint hexagons */}
      <polygon points="200,50 260,85 260,155 200,190 140,155 140,85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
      <polygon points="400,20 460,55 460,125 400,160 340,125 340,55" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
      <polygon points="650,80 710,115 710,185 650,220 590,185 590,115" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
      <polygon points="100,300 160,335 160,405 100,440 40,405 40,335" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      <polygon points="800,250 860,285 860,355 800,390 740,355 740,285" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      <polygon points="300,450 360,485 360,555 300,590 240,555 240,485" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      <polygon points="600,400 660,435 660,505 600,540 540,505 540,435" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
      <polygon points="950,100 1010,135 1010,205 950,240 890,205 890,135" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
      <polygon points="1100,350 1160,385 1160,455 1100,490 1040,455 1040,385" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      <polygon points="150,550 210,585 210,655 150,690 90,655 90,585" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
      <polygon points="750,550 810,585 810,655 750,690 690,655 690,585" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />

      {/* small dots grid */}
      {[...Array(12)].map((_, col) =>
        [...Array(8)].map((_, row) => (
          <circle
            key={`${col}-${row}`}
            cx={80 + col * 110}
            cy={80 + row * 95}
            r="1.5"
            fill="rgba(255,255,255,0.07)"
          />
        ))
      )}

      {/* diagonal lines top right */}
      <line x1="900" y1="0" x2="1200" y2="300" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <line x1="950" y1="0" x2="1200" y2="250" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="1000" y1="0" x2="1200" y2="200" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

      {/* diagonal lines bottom left */}
      <line x1="0" y1="500" x2="300" y2="800" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <line x1="0" y1="550" x2="250" y2="800" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="0" y1="600" x2="200" y2="800" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

      {/* small triangles scattered */}
      <polygon points="500,100 515,130 485,130" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <polygon points="850,300 865,330 835,330" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <polygon points="200,650 215,680 185,680" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <polygon points="1050,500 1065,530 1035,530" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <polygon points="350,200 365,230 335,230" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    </svg>
  </Box>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // TODO: replace with real API call in T012
    console.log('Logging in with', email, password);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ position: 'relative' }}
    >
      <GeometricBackground />

      <Card
        elevation={12}
        sx={{
          width: 320,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
       
        {/* Top banner */}
<Box
  sx={{
    bgcolor: '#B0D4F1',
    borderBottom: '2px solid #1a3a5c',
    py: 2,
    px: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  }}
>
  <img
    src={idbLogo}
    alt="IDB Logo"
    style={{
      height: 70,
      width: '100%',
      objectFit: 'contain',
    }}
  />
  <Typography
    variant="body2"
    sx={{
      color: '#1a3a5c',
      fontWeight: 600,
      letterSpacing: 0.3,
      textAlign: 'center',
      fontSize: '0.78rem',
    }}
  >
    Training & Development Analytics Platform
  </Typography>
</Box>

        <CardContent sx={{ px: 4, py: 3 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="#1a3a5c"
            mb={0.5}
            textAlign="center"
          >
            Sign In
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            mb={2.5}
            textAlign="center"
             
          >
            Enter your credentials to access the platform
          </Typography>

          <Divider sx={{ mb: 2.5 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              size="small"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: '#C8960C' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#C8960C' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle fontSize="small" sx={{ color: '#C8960C' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              size="small"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: '#C8960C' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#C8960C' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined fontSize="small" sx={{ color: '#C8960C' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box display="flex" justifyContent="flex-end" mb={3}>
              <Typography
                variant="body2"
                sx={{
                  color: '#C8960C',
                  cursor: 'pointer',
                  fontWeight: 500,
                  
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            <Box display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                size="small"
                sx={{
                  bgcolor: '#8B1A1A',
                  py: 0.8,
                  px: 4,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  width: '50%',
                  '&:hover': { bgcolor: '#6e1414' },
                }}
              >
                Sign In
              </Button>
            </Box>
          </form>
        </CardContent>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: '#f0f4f8',
            py: 1.5,
            textAlign: 'center',
            borderTop: '1px solid #dce6f0',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Industrial Development Board of Ceylon © {new Date().getFullYear()}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}