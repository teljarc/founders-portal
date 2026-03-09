import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-mono transition-colors disabled:opacity-50 disabled:pointer-events-none';
    const variants = {
      primary: 'bg-text-primary text-bg-primary hover:bg-text-secondary',
      secondary: 'border border-border text-text-primary hover:bg-bg-tertiary',
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
      danger: 'bg-red-900/50 text-red-300 border border-red-800 hover:bg-red-900',
    };
    const sizes = {
      sm: 'text-xs px-2 py-1',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3',
    };
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
