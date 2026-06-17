import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { DeliveryMap } from '@/components/delivery-map';
import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/layout';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrderLocationPing } from '@/hooks/use-order-location-ping';
import { useRiderGps } from '@/hooks/use-rider-gps';
import { orderDisplayId, pickCustomerCoord, pickRestaurantCoord } from '@/lib/orderDisplay';
import { fetchOrderById, fetchOrderRoute } from '@/services/riders';

function resolveOrderId(raw: string | string[] | undefined): string | undefined {
  if (!raw) return undefined;
  return Array.isArray(raw) ? raw[0] : raw;
}

export default function RiderTripMapScreen() {
  const params = useLocalSearchParams<{ orderId: string }>();
  const orderId = resolveOrderId(params.orderId);
  const theme = useTheme();
  const router = useRouter();

  const orderQ = useQuery({
    queryKey: ['rider', 'order', orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: Boolean(orderId),
    retry: 1,
  });

  const order = orderQ.data;
  const isActiveTrip = Boolean(
    order?.orderStatus &&
      ['RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'READY_FOR_PICKUP'].includes(order.orderStatus),
  );

  useOrderLocationPing(order?.orderStatus);
  const riderGps = useRiderGps(isActiveTrip);

  const routeQ = useQuery({
    queryKey: [
      'rider-order-route',
      orderId,
      riderGps ? Math.round(riderGps.latitude * 200) : 0,
      riderGps ? Math.round(riderGps.longitude * 200) : 0,
    ],
    queryFn: () => fetchOrderRoute(orderId!),
    enabled: Boolean(orderId) && isActiveTrip,
    staleTime: 45_000,
  });

  if (!orderId) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <ThemedText>Invalid order</ThemedText>
      </SafeAreaView>
    );
  }

  if (orderQ.isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (orderQ.isError || !order) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <ThemedText>Could not load trip map</ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText type="link" style={{ marginTop: Spacing.two }}>
            Go back
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <ThemedText style={styles.headerTitle}>Trip map</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {orderDisplayId(order)}
            </ThemedText>
          </View>
          <View style={{ width: 32 }} />
        </View>
      </SafeAreaView>

      <DeliveryMap
        restaurant={pickRestaurantCoord(order)}
        customer={pickCustomerCoord(order)}
        rider={riderGps ? { latitude: riderGps.latitude, longitude: riderGps.longitude } : null}
        riderHeading={riderGps?.heading}
        routePath={routeQ.data}
        followRider
        fullScreen
      />

      <SafeAreaView edges={['bottom']} style={[styles.legend, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.legendRow}>
          <LegendDot color="#ff5a00" icon="restaurant" label="Pickup" />
          <LegendDot color="#00BCD4" icon="navigate" label="You" />
          <LegendDot color="#1a1c1c" icon="home" label="Drop" />
        </View>
      </SafeAreaView>
    </View>
  );
}

function LegendDot({
  color,
  icon,
  label,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendPin, { backgroundColor: color }]}>
        <Ionicons name={icon} size={12} color="#ffffff" />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerSafe: { zIndex: 2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  backBtn: { width: 32 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontFamily: Fonts.extraBold },
  legend: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.two,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
