import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'small' | 'label' | 'link';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'small' && styles.small,
        type === 'label' && styles.label,
        type === 'link' && [styles.link, { color: theme.primary }],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.medium,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: Fonts.extraBold,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.medium,
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.medium,
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  link: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
});
