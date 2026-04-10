import React, { useState } from 'react';

export const FormInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div style={{ marginBottom: '12px' }}>

      {label && (
        <label style={{
          display: 'block',
          fontSize: '0.78rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '5px',
        }}>
          {label}
          {required && <span style={{ color: '#8B1A1A', marginLeft: '3px' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>

        {Icon && (
          <span style={{
            position: 'absolute',
            left: '10px',
            display: 'flex',
            alignItems: 'center',
            color: '#9ca3af',
            pointerEvents: 'none',
            zIndex: 1,
          }}>
            <Icon size={15} strokeWidth={1.8} />
          </span>
        )}

        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '8px 10px',
            paddingLeft: Icon ? '32px' : '10px',
            paddingRight: type === 'password' ? '34px' : '10px',
            fontSize: '0.82rem',
            color: '#111827',
            backgroundColor: '#ffffff',
            border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.15)';
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
            e.target.style.boxShadow = 'none';
          }}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            style={{
              position: 'absolute',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: 0,
            }}
          >
            {showPassword ? (
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75C21.27 7.61 17 4.5 12 4.5c-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
              </svg>
            ) : (
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '3px' }}>{error}</p>}
    </div>
  );
};

export default FormInput;
