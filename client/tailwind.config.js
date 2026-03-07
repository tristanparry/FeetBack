module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  plugins: [],
  theme: {
    extend: {
      colors: {
        'primary-background': 'var(--color-primary-background)',
        'secondary-background': 'var(--color-secondary-background)',
        'tertiary-background': 'var(--color-tertiary-background)',
        'primary-text': 'var(--color-primary-text)',
        'secondary-text': 'var(--color-secondary-text)',
        'primary-accent': 'var(--color-primary-accent)',
        'secondary-accent': 'var(--color-secondary-accent)',
        success: 'var(--color-success)',
        'success-soft': 'var(--color-success-soft)',
        warning: 'var(--color-warning)',
        'warning-soft': 'var(--color-warning-soft)',
        error: 'var(--color-error)',
        'error-soft': 'var(--color-error-soft)',
        info: 'var(--color-info)',
        'info-soft': 'var(--color-info-soft)',
      },
    },
  },
};
