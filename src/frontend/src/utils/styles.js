// Comprehensive Styles Utility File
// This file contains reusable styles and CSS-in-JS patterns for the entire application

export const commonStyles = {
  // Layout & Spacing
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  
  // Typography
  heading: {
    large: 'text-4xl md:text-6xl font-bold leading-tight',
    medium: 'text-2xl md:text-4xl font-bold leading-tight',
    small: 'text-xl md:text-2xl font-semibold leading-tight',
  },
  
  text: {
    large: 'text-lg md:text-xl leading-relaxed',
    medium: 'text-base md:text-lg leading-relaxed',
    small: 'text-sm md:text-base leading-relaxed',
  },
  
  // Colors
  colors: {
    primary: {
      light: '#eff6ff',
      main: '#3b82f6',
      dark: '#1d4ed8',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    },
    success: {
      light: '#f0fdf4',
      main: '#22c55e',
      dark: '#16a34a',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    warning: {
      light: '#fffbeb',
      main: '#f59e0b',
      dark: '#d97706',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    danger: {
      light: '#fef2f2',
      main: '#ef4444',
      dark: '#dc2626',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
  },
  
  // Shadows
  shadows: {
    small: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  
  // Borders
  borders: {
    radius: {
      small: '0.375rem',
      medium: '0.5rem',
      large: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
    width: {
      thin: '1px',
      normal: '2px',
      thick: '3px',
    },
  },
  
  // Transitions
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Animations
  animations: {
    fadeIn: 'fadeIn 0.5s ease-in-out',
    fadeInUp: 'fadeInUp 0.6s ease-out',
    slideIn: 'slideIn 0.3s ease-out',
    bounce: 'bounce 1s infinite',
    pulse: 'pulse 2s infinite',
    spin: 'spin 1s linear infinite',
  },
};

// Component-specific styles
export const componentStyles = {
  // Button variants
  button: {
    base: 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    sizes: {
      small: 'px-3 py-2 text-sm',
      medium: 'px-4 py-3 text-base',
      large: 'px-6 py-4 text-lg',
    },
    variants: {
      primary: 'bg-gradient-primary text-white hover:shadow-lg hover:scale-105 focus:ring-primary-500',
      secondary: 'bg-gradient-secondary text-white hover:shadow-lg hover:scale-105 focus:ring-secondary-500',
      success: 'bg-gradient-success text-white hover:shadow-lg hover:scale-105 focus:ring-success-500',
      danger: 'bg-gradient-danger text-white hover:shadow-lg hover:scale-105 focus:ring-danger-500',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:scale-105',
      ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105',
    },
  },
  
  // Card variants
  card: {
    base: 'bg-white rounded-2xl shadow-lg border border-gray-200/50 transition-all duration-300',
    variants: {
      default: 'hover:shadow-xl hover:scale-105',
      interactive: 'cursor-pointer hover:shadow-2xl hover:scale-105',
      elevated: 'shadow-xl hover:shadow-2xl',
      glass: 'bg-white/80 backdrop-blur-sm border-white/20',
    },
  },
  
  // Input variants
  input: {
    base: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2',
    variants: {
      default: 'focus:border-primary-500 focus:ring-primary-500/20',
      success: 'border-success-300 focus:border-success-500 focus:ring-success-500/20',
      error: 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/20',
    },
    sizes: {
      small: 'px-3 py-2 text-sm',
      medium: 'px-4 py-3 text-base',
      large: 'px-6 py-4 text-lg',
    },
  },
  
  // Badge variants
  badge: {
    base: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200',
    variants: {
      primary: 'bg-primary-100 text-primary-800 border border-primary-200',
      success: 'bg-success-100 text-success-800 border border-success-200',
      warning: 'bg-warning-100 text-warning-800 border border-warning-200',
      danger: 'bg-danger-100 text-danger-800 border border-danger-200',
      info: 'bg-blue-100 text-blue-800 border border-blue-200',
    },
  },
};

// Layout utilities
export const layoutStyles = {
  // Grid layouts
  grid: {
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    autoFit: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    masonry: 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4',
  },
  
  // Flexbox layouts
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    row: 'flex flex-row',
  },
  
  // Spacing utilities
  spacing: {
    section: 'py-16 md:py-24',
    container: 'px-4 sm:px-6 lg:px-8',
    stack: 'space-y-4 md:space-y-6 lg:space-y-8',
  },
};

// Animation utilities
export const animationStyles = {
  // Stagger animations
  stagger: (index, delay = 0.1) => ({
    animationDelay: `${index * delay}s`,
  }),
  
  // Hover effects
  hover: {
    scale: 'hover:scale-105 transition-transform duration-300',
    lift: 'hover:-translate-y-1 hover:shadow-xl transition-all duration-300',
    glow: 'hover:shadow-lg hover:shadow-primary-500/25 transition-shadow duration-300',
  },
  
  // Focus effects
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
    ringPrimary: 'focus:ring-primary-500',
    ringSuccess: 'focus:ring-success-500',
    ringWarning: 'focus:ring-warning-500',
    ringDanger: 'focus:ring-danger-500',
  },
};

// Responsive utilities
export const responsiveStyles = {
  // Breakpoint-specific styles
  mobile: {
    hidden: 'block md:hidden',
    textCenter: 'text-center md:text-left',
    stack: 'flex-col md:flex-row',
  },
  
  desktop: {
    hidden: 'hidden md:block',
    textLeft: 'text-center md:text-left',
    row: 'flex-col md:flex-row',
  },
  
  // Container queries (future-proof)
  container: {
    small: 'container-sm',
    medium: 'container-md',
    large: 'container-lg',
    xl: 'container-xl',
  },
};

// Theme utilities
export const themeStyles = {
  // Light theme
  light: {
    bg: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
    shadow: 'shadow-gray-200/50',
  },
  
  // Dark theme (for future use)
  dark: {
    bg: 'bg-gray-900',
    text: 'text-white',
    border: 'border-gray-700',
    shadow: 'shadow-black/50',
  },
  
  // Glass morphism
  glass: {
    bg: 'bg-white/80 backdrop-blur-sm',
    border: 'border-white/20',
    shadow: 'shadow-white/10',
  },
};

// Export all styles as a single object
export const styles = {
  ...commonStyles,
  ...componentStyles,
  ...layoutStyles,
  ...animationStyles,
  ...responsiveStyles,
  ...themeStyles,
};

// Default export
export default styles;
