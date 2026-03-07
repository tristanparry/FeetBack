import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { vars } from 'nativewind';

const tokens = {
  light: {
    primaryBackground: 'hsl(0, 0%, 100%)',
    secondaryBackground: 'hsl(0, 0%, 90%)',
    tertiaryBackground: 'hsl(0, 0%, 75%)',
    primaryText: 'hsl(0, 0%, 5%)',
    secondaryText: 'hsl(0, 0%, 30%)',
    primaryAccent: 'hsl(220, 100%, 40%)',
    secondaryAccent: 'hsl(220, 100%, 60%)',
    success: 'hsl(140, 70%, 40%)',
    successSoft: 'hsl(140, 70%, 85%)',
    warning: 'hsl(50, 70%, 50%)',
    warningSoft: 'hsl(50, 70%, 85%)',
    error: 'hsl(0, 70%, 50%)',
    errorSoft: 'hsl(0, 70%, 85%)',
    info: 'hsl(220, 90%, 50%)',
    infoSoft: 'hsl(220, 90%, 85%)',

    gradients: {
      neutral: ['hsl(140, 70%, 90%)', 'hsl(0, 0%, 92%)'],
      mild: ['hsl(50, 70%, 90%)', 'hsl(0, 0%, 92%)'],
      severe: ['hsl(0, 70%, 90%)', 'hsl(0, 0%, 92%)'],
      primaryBackgroundTransparent: [
        'rgba(255,255,255,1)',
        'rgba(255,255,255,0)',
      ],
      secondaryBackgroundTransparent: [
        'rgba(230,230,230,1)',
        'rgba(255,255,255,0)',
      ],
    },
  },
  dark: {
    primaryBackground: 'hsl(0, 0%, 0%)',
    secondaryBackground: 'hsl(0, 0%, 10%)',
    tertiaryBackground: 'hsl(0, 0%, 25%)',
    primaryText: 'hsl(0, 0%, 95%)',
    secondaryText: 'hsl(0, 0%, 70%)',
    primaryAccent: 'hsl(220, 100%, 60%)',
    secondaryAccent: 'hsl(220, 100%, 40%)',
    success: 'hsl(140, 70%, 60%)',
    successSoft: 'hsl(140, 70%, 15%)',
    warning: 'hsl(50, 70%, 50%)',
    warningSoft: 'hsl(50, 70%, 15%)',
    error: 'hsl(0, 70%, 50%)',
    errorSoft: 'hsl(0, 70%, 15%)',
    info: 'hsl(220, 90%, 50%)',
    infoSoft: 'hsl(220, 90%, 15%)',

    gradients: {
      neutral: ['hsl(140, 70%, 8%)', 'hsl(0, 0%, 10%)'],
      mild: ['hsl(50, 70%, 8%)', 'hsl(0, 0%, 10%)'],
      severe: ['hsl(0, 70%, 8%)', 'hsl(0, 0%, 10%)'],
      primaryBackgroundTransparent: ['rgba(0,0,0,1)', 'rgba(255,255,255,0)'],
      secondaryBackgroundTransparent: [
        'rgba(26,26,26,1)',
        'rgba(255,255,255,0)',
      ],
    },
  },
};

export const themes = {
  light: vars({
    '--color-primary-background': tokens.light.primaryBackground,
    '--color-secondary-background': tokens.light.secondaryBackground,
    '--color-tertiary-background': tokens.light.tertiaryBackground,
    '--color-primary-text': tokens.light.primaryText,
    '--color-secondary-text': tokens.light.secondaryText,
    '--color-primary-accent': tokens.light.primaryAccent,
    '--color-secondary-accent': tokens.light.secondaryAccent,
    '--color-success': tokens.light.success,
    '--color-success-soft': tokens.light.successSoft,
    '--color-warning': tokens.light.warning,
    '--color-warning-soft': tokens.light.warningSoft,
    '--color-error': tokens.light.error,
    '--color-error-soft': tokens.light.errorSoft,
    '--color-info': tokens.light.info,
    '--color-info-soft': tokens.light.infoSoft,
  }),
  dark: vars({
    '--color-primary-background': tokens.dark.primaryBackground,
    '--color-secondary-background': tokens.dark.secondaryBackground,
    '--color-tertiary-background': tokens.dark.tertiaryBackground,
    '--color-primary-text': tokens.dark.primaryText,
    '--color-secondary-text': tokens.dark.secondaryText,
    '--color-primary-accent': tokens.dark.primaryAccent,
    '--color-secondary-accent': tokens.dark.secondaryAccent,
    '--color-success': tokens.dark.success,
    '--color-success-soft': tokens.dark.successSoft,
    '--color-warning': tokens.dark.warning,
    '--color-warning-soft': tokens.dark.warningSoft,
    '--color-error': tokens.dark.error,
    '--color-error-soft': tokens.dark.errorSoft,
    '--color-info': tokens.dark.info,
    '--color-info-soft': tokens.dark.infoSoft,
  }),
};

export const jsColors = {
  light: tokens.light,
  dark: tokens.dark,
};

export const LightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: jsColors.light.primaryBackground,
    card: jsColors.light.primaryBackground,
    text: jsColors.light.primaryText,
    border: jsColors.light.tertiaryBackground,
    primary: jsColors.light.primaryAccent,
  },
};

export const DarkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: jsColors.dark.primaryBackground,
    card: jsColors.dark.primaryBackground,
    text: jsColors.dark.primaryText,
    border: jsColors.dark.tertiaryBackground,
    primary: jsColors.dark.primaryAccent,
  },
};
