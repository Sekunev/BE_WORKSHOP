import { StyleSheet } from 'react-native';
import { Theme } from './themes';

// Common style utilities that work with any theme
export const createCommonStyles = (theme: Theme) => StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  // Card styles
  card: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  
  cardElevated: {
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    ...theme.shadows.md,
  },
  
  // Text styles
  heading1: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize['3xl'] * theme.typography.lineHeight.tight,
  },
  
  heading2: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.tight,
  },
  
  heading3: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.normal,
  },
  
  bodyLarge: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.normal,
  },
  
  body: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  },
  
  bodySmall: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
  },
  
  caption: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.tertiary,
    lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
  },
  
  // Layout styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  columnCenter: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Spacing utilities
  marginXs: { margin: theme.spacing.xs },
  marginSm: { margin: theme.spacing.sm },
  marginMd: { margin: theme.spacing.md },
  marginLg: { margin: theme.spacing.lg },
  marginXl: { margin: theme.spacing.xl },
  
  paddingXs: { padding: theme.spacing.xs },
  paddingSm: { padding: theme.spacing.sm },
  paddingMd: { padding: theme.spacing.md },
  paddingLg: { padding: theme.spacing.lg },
  paddingXl: { padding: theme.spacing.xl },
  
  // Margin specific directions
  marginTopXs: { marginTop: theme.spacing.xs },
  marginTopSm: { marginTop: theme.spacing.sm },
  marginTopMd: { marginTop: theme.spacing.md },
  marginTopLg: { marginTop: theme.spacing.lg },
  
  marginBottomXs: { marginBottom: theme.spacing.xs },
  marginBottomSm: { marginBottom: theme.spacing.sm },
  marginBottomMd: { marginBottom: theme.spacing.md },
  marginBottomLg: { marginBottom: theme.spacing.lg },
  
  marginHorizontalXs: { marginHorizontal: theme.spacing.xs },
  marginHorizontalSm: { marginHorizontal: theme.spacing.sm },
  marginHorizontalMd: { marginHorizontal: theme.spacing.md },
  marginHorizontalLg: { marginHorizontal: theme.spacing.lg },
  
  marginVerticalXs: { marginVertical: theme.spacing.xs },
  marginVerticalSm: { marginVertical: theme.spacing.sm },
  marginVerticalMd: { marginVertical: theme.spacing.md },
  marginVerticalLg: { marginVertical: theme.spacing.lg },
  
  // Padding specific directions
  paddingTopXs: { paddingTop: theme.spacing.xs },
  paddingTopSm: { paddingTop: theme.spacing.sm },
  paddingTopMd: { paddingTop: theme.spacing.md },
  paddingTopLg: { paddingTop: theme.spacing.lg },
  
  paddingBottomXs: { paddingBottom: theme.spacing.xs },
  paddingBottomSm: { paddingBottom: theme.spacing.sm },
  paddingBottomMd: { paddingBottom: theme.spacing.md },
  paddingBottomLg: { paddingBottom: theme.spacing.lg },
  
  paddingHorizontalXs: { paddingHorizontal: theme.spacing.xs },
  paddingHorizontalSm: { paddingHorizontal: theme.spacing.sm },
  paddingHorizontalMd: { paddingHorizontal: theme.spacing.md },
  paddingHorizontalLg: { paddingHorizontal: theme.spacing.lg },
  
  paddingVerticalXs: { paddingVertical: theme.spacing.xs },
  paddingVerticalSm: { paddingVertical: theme.spacing.sm },
  paddingVerticalMd: { paddingVertical: theme.spacing.md },
  paddingVerticalLg: { paddingVertical: theme.spacing.lg },
  
  // Border styles
  border: {
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
  },
  
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  
  borderRadius: {
    borderRadius: theme.borderRadius.md,
  },
  
  borderRadiusLarge: {
    borderRadius: theme.borderRadius.lg,
  },
  
  // Shadow styles
  shadowSm: theme.shadows.sm,
  shadowMd: theme.shadows.md,
  shadowLg: theme.shadows.lg,
  shadowXl: theme.shadows.xl,
  
  // Position utilities
  absolute: {
    position: 'absolute',
  },
  
  relative: {
    position: 'relative',
  },
  
  // Flex utilities
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  
  // Alignment utilities
  alignCenter: { alignItems: 'center' },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  alignStretch: { alignItems: 'stretch' },
  
  justifyCenter: { justifyContent: 'center' },
  justifyStart: { justifyContent: 'flex-start' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyAround: { justifyContent: 'space-around' },
  justifyEvenly: { justifyContent: 'space-evenly' },
  
  // Text alignment
  textCenter: { textAlign: 'center' },
  textLeft: { textAlign: 'left' },
  textRight: { textAlign: 'right' },
  
  // Opacity utilities
  opacityDisabled: { opacity: theme.opacity.disabled },
  opacityPressed: { opacity: theme.opacity.pressed },
  
  // Background utilities
  backgroundPrimary: { backgroundColor: theme.colors.background.primary },
  backgroundSecondary: { backgroundColor: theme.colors.background.secondary },
  backgroundCard: { backgroundColor: theme.colors.surface.primary },
  
  // Common input styles
  inputContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface.primary,
  },
  
  inputFocused: {
    borderColor: theme.colors.border.focus,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: theme.colors.border.error,
  },
  
  // Common button styles
  buttonBase: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.primary,
    marginVertical: theme.spacing.md,
  },
  
  dividerVertical: {
    width: 1,
    backgroundColor: theme.colors.border.primary,
    marginHorizontal: theme.spacing.md,
  },
});

// Export a hook to use common styles with current theme
export const useCommonStyles = (theme: Theme) => {
  return createCommonStyles(theme);
};