import React from 'react';
import { Atom } from 'react-loading-indicators';

interface LoadingSpinnerProps {
  /** Whether to show the loading spinner */
  isLoading: boolean;
  /** Custom message to display below the spinner */
  message?: string;
  /** Custom colors for the spinner */
  colors?: string[];
  /** Size of the spinner */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show as overlay (full screen) */
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  isLoading,
  message = 'Loading...',
  colors = ["#e14e4e", "#97e14e", "#4ee1e1", "#974ee1"],
  size = 'medium',
  overlay = false
}) => {
  if (!isLoading) return null;

  const sizeMap = {
    small: "small" as const,
    medium: "medium" as const,
    large: "large" as const
  };

  const spinnerSize = sizeMap[size];

  const spinnerComponent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Atom 
        color={colors}
        size={spinnerSize}
      />
      {message && (
        <p className="text-sm text-gray-800 dark:text-white font-medium animate-pulse drop-shadow-sm">
          {message}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-md">
        <div className="bg-white/15 dark:bg-gray-900/25 backdrop-blur-xl border border-white/30 dark:border-white/20 p-10 rounded-3xl shadow-2xl ring-1 ring-white/20 dark:ring-white/10">
          {spinnerComponent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinnerComponent}
    </div>
  );
};

export default LoadingSpinner;