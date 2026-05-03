export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'font-medium rounded-md transition-colors duration-200 flex items-center gap-2 justify-center';

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-opacity-90 disabled:opacity-50',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-opacity-90 disabled:opacity-50',
    outline: 'border border-border text-foreground hover:bg-muted disabled:opacity-50',
    danger: 'bg-destructive text-destructive-foreground hover:bg-opacity-90 disabled:opacity-50',
    ghost: 'text-foreground hover:bg-muted disabled:opacity-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-[13px]',
    md: 'px-4 py-2 text-[15px]',
    lg: 'px-6 py-3 text-[15px]',
  };

  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalClassName}
      {...props}
    >
      {children}
    </button>
  );
}
