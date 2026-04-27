import React, { useState } from 'react';
import idbLogo from '../assets/idb-new-logo.webp';
import { useMutation } from '@tanstack/react-query';
import { login } from '../services/authService';
import useAuthStore from '../store/authStore';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';

const GeometricBackground = () => (
  <div
    className="fixed inset-0 z-0 overflow-hidden"
    style={{ background: 'linear-gradient(135deg, #0f2035 0%, #1a3a5c 50%, #4a0f0f 100%)' }}
  >
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
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
      {[...Array(12)].map((_, col) =>
        [...Array(8)].map((_, row) => (
          <circle key={`${col}-${row}`} cx={80 + col * 110} cy={80 + row * 95} r="1.5" fill="rgba(255,255,255,0.07)" />
        ))
      )}
      <line x1="900" y1="0" x2="1200" y2="300" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <line x1="950" y1="0" x2="1200" y2="250" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="1000" y1="0" x2="1200" y2="200" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="0" y1="500" x2="300" y2="800" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <line x1="0" y1="550" x2="250" y2="800" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="0" y1="600" x2="200" y2="800" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <polygon points="500,100 515,130 485,130" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <polygon points="850,300 865,330 835,330" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <polygon points="200,650 215,680 185,680" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <polygon points="1050,500 1065,530 1035,530" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <polygon points="350,200 365,230 335,230" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    </svg>
  </div>
);

// Password field with show/hide toggle
function PasswordInput({ value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Lock
        size={14}
        style={{
          position: 'absolute',
          left: '14px',
          color: '#C8960C',
          pointerEvents: 'none',
          flexShrink: 0
        }}
      />
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          paddingLeft: '42px',
          paddingRight: '42px',
          height: '48px'
        }}
        className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        style={{
          position: 'absolute',
          right: '14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B7280',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.user.role);
      toast.success('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    let valid = true;

    if (!email) {
      setEmailError('Email address is required.');
      valid = false;
    } else if (!email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    }

    if (!valid) return;

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4">
      <GeometricBackground />
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-md" style={{ margin: '40px' }}>
        <Card className="relative z-10 w-full border-0 shadow-2xl overflow-hidden rounded-lg mx-auto">
        {/* Light Blue Header Section */}
        <div
          className="w-full  flex items-center justify-center"
          style={{ backgroundColor: '#B0D4F1' }}
        >
          <img src={idbLogo} alt="IDB Logo" className="h-16 w-auto" />
        </div>

        {/* White Body Section */}
        <div className="bg-white" style={{ padding: '40px' }}>
          <CardHeader className="">
            <CardTitle className="text-center text-3xl font-bold mb-2" style={{ color: '#1a3a5c' }}>
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-sm text-gray-600">
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-6 pb-8" style={{ margin: '20px 0px' }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email field */}
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-700 ml-0.5">
                  Email Address <span style={{ color: '#8B1A1A' }}>*</span>
                </Label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User
                    size={14}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      color: '#FFD700',
                      pointerEvents: 'none',
                      flexShrink: 0
                    }}
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    placeholder="yeshiiifashion@gmail.com"
                    style={{ paddingLeft: '42px', height: '48px' }}
                    className={emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                </div>
                {emailError && (
                  <p className="text-red-500 text-xs mt-1.5 ml-0.5">{emailError}</p>
                )}
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-700 ml-0.5">
                  Password <span style={{ color: '#8B1A1A' }}>*</span>
                </Label>
                <PasswordInput
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                  placeholder="••••••••"
                  error={passwordError}
                />
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1.5 ml-0.5">{passwordError}</p>
                )}
                {/* Forgot password link - moved here */}
                <div className="flex justify-end mt-3">
                  <span
                    className="text-xs font-semibold cursor-pointer hover:underline transition-all"
                    style={{ color: '#FFB84D' }}
                  >
                    Forgot password?
                  </span>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full text-white font-semibold mt-8 transition-all duration-200"
                style={{
                  backgroundColor: '#8B1A1A',
                  borderColor: '#8B1A1A',
                  height: '44px',
                  fontSize: '14px'
                }}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </div>

        {/* Footer Section */}
        <div className="w-full px-8 py-5 text-center border-t border-gray-100" style={{ backgroundColor: '#F9FAFB' }}>
          <p className="text-xs text-gray-500 tracking-wide">
            Industrial Development Board of Ceylon © 2026
          </p>
        </div>
      </Card>
      </div>
    </div>
  );
}