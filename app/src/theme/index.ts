import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1a73e8',
  primaryDark: '#1557b0',
  secondary: '#34a853',
  warning: '#f9ab00',
  error: '#ea4335',
  background: '#f0f4f8',
  surface: '#ffffff',
  text: '#202124',
  textSecondary: '#5f6368',
  textLight: '#80868b',
  border: '#dadce0',
  divider: '#e8eaed',
  accent: '#e8f0fe',
  portfolioGreen: '#137333',
  portfolioBlue: '#1a73e8',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 32,
};

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  body: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonOutlineText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
  },
});
