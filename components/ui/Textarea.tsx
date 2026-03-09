import { TextareaHTMLAttributes, forwardRef } from 'react';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full bg-bg-tertiary border border-border text-text-primary px-3 py-2 text-sm font-mono placeholder:text-text-muted focus:outline-none focus:border-text-secondary resize-y min-h-[80px] ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
export default Textarea;
