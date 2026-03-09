interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export default function Badge({ children, color, className = '' }: BadgeProps) {
  const style = color ? { backgroundColor: `${color}20`, color, borderColor: `${color}40` } : {};
  return (
    <span
      className={`inline-flex items-center text-xs font-mono px-2 py-0.5 border ${!color ? 'border-border text-text-secondary' : ''} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
