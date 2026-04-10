/**
 * Button component - reusable button with variants
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  style,
  ...props
}) => {
  const baseStyles =
    'font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-primary hover:bg-primary-dark text-white',
    secondary: 'bg-secondary hover:bg-yellow-600 text-white',
    outline:   'border-2 border-primary hover:bg-primary hover:text-white text-primary',
    danger:    'bg-red-500 hover:bg-red-600 text-white',
  };

  const sizes = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-6 text-base',
    lg: 'py-3 px-8 text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      style={style}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
