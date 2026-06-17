import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  DELIVERY_FLOW_STEPS,
  RIDER_STATUS_LABELS,
  stepIndexForStatus,
} from '@/constants/deliveryStatus';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function DeliveryStatusStepper({ status }: { status: string }) {
  const theme = useTheme();
  const current = stepIndexForStatus(status);

  return (
    <View style={styles.wrap}>
      <ThemedText type="label" style={{ color: theme.primary }}>
        {RIDER_STATUS_LABELS[status] ?? status}
      </ThemedText>
      {DELIVERY_FLOW_STEPS.map((step, idx) => {
        const done = current > idx;
        const active = current === idx;
        return (
          <View key={step.status} style={styles.row}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: done || active ? theme.primary : theme.backgroundSelected,
                  borderColor: done || active ? theme.primary : theme.border,
                },
              ]}
            />
            <View style={{ flex: 1 }}>
              <ThemedText
                type="small"
                style={{
                  fontFamily: active || done ? Fonts.bold : Fonts.medium,
                  color: active || done ? theme.text : theme.textSecondary,
                }}>
                {step.label}
              </ThemedText>
              {active ? (
                <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 2 }}>
                  {step.description}
                </ThemedText>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.one },
  row: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start', paddingVertical: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, marginTop: 3 },
});
