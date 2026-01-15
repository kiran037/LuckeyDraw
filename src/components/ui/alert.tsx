// src/components/ui/alert.tsx
import * as React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import clsx from 'clsx';

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
}

const VARIANT_STYLES = {
  default: {
    container: 'bg-gray-50 border-gray-200 text-gray-900',
    icon: Info,
    iconColor: 'text-gray-600',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: Info,
    iconColor: 'text-blue-600',
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-900',
    icon: CheckCircle2,
    iconColor: 'text-green-600',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: AlertCircle,
    iconColor: 'text-amber-600',
  },
  danger: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      title,
      icon: customIcon,
      onClose,
      children,
      ...props
    },
    ref
  ) => {
    const variantConfig = VARIANT_STYLES[variant];
    const Icon = variantConfig.icon;

    return (
      <div
        ref={ref}
        role="alert"
        className={clsx(
          'relative flex items-start gap-3',
          'rounded-xl border p-4',
          'transition-all duration-200',
          variantConfig.container,
          className
        )}
        {...props}
      >
        {/* Icon */}
        <span className={clsx(
          'flex h-5 w-5 flex-shrink-0 items-center justify-center',
          variantConfig.iconColor
        )}>
          {customIcon || <Icon className="h-5 w-5" />}
        </span>

        {/* Content */}
        <div className="flex-1 space-y-1">
          {title && (
            <div className="font-semibold text-sm leading-tight">
              {title}
            </div>
          )}
          <div className="text-sm leading-relaxed">
            {children}
          </div>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss alert"
            className={clsx(
              'flex-shrink-0 inline-flex h-6 w-6 items-center justify-center',
              'rounded-md text-current opacity-50',
              'transition-opacity hover:opacity-100',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current'
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';