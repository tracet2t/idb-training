import React, { useState } from 'react';
import idbLogo from '../assets/idb-new-logo.webp';
import { useMutation } from '@tanstack/react-query';
import { login } from '../services/authService';
import useAuthStore from '../store/authStore';
import { Mail, Lock } from 'lucide-react';

import { FormInput } from '../components/FormInput';
import { Toast } from '../components/Toast';

const GeometricBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden"
    style={{ background: 'linear-gradient(135deg, #0f2035 0%, #1a3a5c 50%, #4a0f0f 100%)' }}
  >
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
      <polygon points="200,50 260,85 260,155 200,190 140,155 140,85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
      <polygon points="400,20 460,55 460,125 400,160 340,125 340,55" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
      <polygon points="650,80 710,115 710,185 650,220 590,185 590,115" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
      <polygon points="100,300 160,335 160,405 100,440 40,405 40,335" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      <polygon points="800,250 860,285 860,355 800,390 740,355 740,285" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      <polygon points="300,450 360,485 360,555 300,590 240,555 240,485" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      {[...Array(12)].map((_, col) =>
        [...Array(8)].map((_, row) => (
          <circle key={`${col}-${row}`} cx={80 + col * 110} cy={80 + row * 95} r="1.5" fill="rgba(255,255,255,0.07)" />
        ))
      )}
    </svg>
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Per-field inline errors
  const [emailError, setEmailError]       = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Toast only for API errors (login failed)
  const [toast, setToast] = useState({ open: false, message: '', type: 'error' });

  const showPopup = (message, severity) => {
    setToast({ open: true, message, type: severity });
  };

  // 3. Zustand
  const setAuth = useAuthStore((state) => state.setAuth);

  // 4. TanStack Query mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => login(email, password),

    onSuccess: (data) => {
      setAuth(data.user, data.user.role);
      showPopup('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    },

    onError: (err) => {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      showPopup(message, 'error');
    },
  });
  
  // 5. form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset errors
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
    <div className="relative flex items-center justify-center min-h-screen">
      <GeometricBackground />

      {/* Toast only for API-level errors/success */}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.open}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
      />

      {/* Card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '380px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        backgroundColor: '#ffffff',
      }}>

        {/* Top banner */}
        <div style={{
          backgroundColor: '#B0D4F1',
          borderBottom: '2px solid #1a3a5c',
          padding: '16px 20px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}>
          <img src={idbLogo} alt="IDB Logo" style={{ height: '60px', objectFit: 'contain' }} />
          <p style={{
            fontSize: '0.72rem',
            fontWeight: '600',
            fontStyle: 'italic',
            color: '#1a3a5c',
            textAlign: 'center',
            margin: 0,
          }}>
            Training &amp; Development Analytics Platform
          </p>
        </div>

        {/* Form area */}
        <div style={{ padding: '20px 24px 16px' }}>

          <h2 style={{
            textAlign: 'center',
            fontWeight: '700',
            fontSize: '1.4rem',
            color: '#1a3a5c',
            margin: '0 0 4px',
          }}>
            Sign In
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.78rem',
            margin: '0 0 14px',
          }}>
            Enter your credentials to access the platform
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '14px' }} />

          <form onSubmit={handleSubmit}>

            {/* Email — error shows inline below the field */}
            <FormInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              placeholder="ishari1234@gmail.com"
              icon={Mail}
              error={emailError}
              required
            />

            {/* Password — error shows inline below the field */}
            <FormInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              placeholder="•••••••"
              icon={Lock}
              error={passwordError}
              required
            />

            {/* Forgot password */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px', marginBottom: '14px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#C8960C',
                cursor: 'pointer',
              }}>
                Forgot password?
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#8B1A1A',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.88rem',
                letterSpacing: '0.04em',
                border: 'none',
                borderRadius: '8px',
                cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: loginMutation.isPending ? 0.75 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'opacity 0.2s',
              }}
            >
              {loginMutation.isPending ? (
                <>
                  <svg style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" style={{ opacity: 0.75 }} />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>

          </form>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#f0f4f8',
          borderTop: '1px solid #e5e7eb',
          padding: '10px',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#9ca3af',
        }}>
          Industrial Development Board of Ceylon © {new Date().getFullYear()}
        </div>

      </div>
    </div>
  );
}
