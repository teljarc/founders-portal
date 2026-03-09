import { InputHTMLAttributes, forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-bg-tertiary border border-border text-text-primary px-3 py-2 text-sm font-mono placeholder:text-text-muted focus:outline-none focus:border-text-secondary ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
export default Input;
