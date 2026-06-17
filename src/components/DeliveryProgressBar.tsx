import { Fragment } from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DELIVERY_FLOW_STEPS, stepIndexForStatus } from '@/constants/deliveryStatus';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  status: string;
  compact?: boolean;
};

export function DeliveryProgressBar({ status, compact }: Props) {
  const theme = useTheme();
  const current = stepIndexForStatus(status);
  const isPreview = status === 'READY_FOR_PICKUP';

  if (isPreview) {
    return (
      <View style={[styles.previewBar, { backgroundColor: theme.primarySoft }]}>
        <ThemedText style={[styles.previewText, { color: theme.primary }]}>
          New delivery — accept to start
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {DELIVERY_FLOW_STEPS.map((step, idx) => {
          const done = current > idx;
          const active = current === idx;
          const isLast = idx === DELIVERY_FLOW_STEPS.length - 1;
          return (
            <Fragment key={step.status}>
              <View style={styles.dotCol}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: done || active ? theme.primary : theme.backgroundElement,
                      borderColor: done || active ? theme.primary : theme.border,
                    },
                  ]}
                />
                {!compact ? (
                  <ThemedText
                    numberOfLines={1}
                    style={[
                      styles.label,
                      {
                        color: active || done ? theme.text : theme.textSecondary,
                        fontFamily: active ? Fonts.bold : Fonts.medium,
                      },
                    ]}>
                    {step.label}
                  </ThemedText>
                ) : null}
              </View>
              {!isLast ? (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: done ? theme.primary : theme.border },
                  ]}
                />
              ) : null}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  track: { flexDirection: 'row', alignItems: 'flex-start' },
  dotCol: { alignItems: 'center', width: 56 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  connector: {
    flex: 1,
    height: 2,
    marginTop: 6,
    marginHorizontal: -4,
  },
  label: {
    fontSize: 9,
    marginTop: 6,
    textAlign: 'center',
    width: 56,
  },
  previewBar: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
