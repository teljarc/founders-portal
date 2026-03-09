import { HTMLAttributes } from 'react';

export default function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border border-border bg-bg-secondary p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
