import { Fonts } from '@/constants/theme';

/** Layout patterns shared with restaurant portal */
export const Layout = {
  screenPadding: 16,
  /** @deprecated – use useSafeAreaInsets() in ScreenHeader instead */
  screenTop: 56,
  cardRadius: 16,
  inputRadius: 12,
  buttonRadius: 12,
  borderColor: 'rgba(0,0,0,0.06)',
} as const;

export const labelStyle = {
  fontSize: 10,
  fontFamily: Fonts.bold,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.6,
};

export const pageTitleStyle = {
  fontSize: 24,
  fontFamily: Fonts.extraBold,
};

export const cardStyle = {
  borderRadius: Layout.cardRadius,
  borderWidth: 1,
  borderColor: Layout.borderColor,
};
