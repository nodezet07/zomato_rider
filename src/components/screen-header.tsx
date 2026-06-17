import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/layout';
import { Spacing } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, right }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <ThemedText type="title" numberOfLines={1}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.two,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
});
