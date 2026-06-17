import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AvailableOrderCard } from '@/components/AvailableOrderCard';
import { ScreenHeader } from '@/components/screen-header';
import { TabScrollView } from '@/components/tab-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Layout, cardStyle } from '@/constants/layout';
import { Fonts, Spacing } from '@/constants/theme';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { useTheme } from '@/hooks/use-theme';
import { acceptOrder, fetchAvailableOrders, fetchRiderProfile } from '@/services/riders';
import { useRiderStore } from '@/stores/riderStore';

export default function JobsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const qc = useQueryClient();
  const tabBarHeight = useTabBarHeight();
  const rider = useRiderStore((s) => s.rider);
  const setRider = useRiderStore((s) => s.setRider);
  const hasActive = Boolean(rider?.currentOrderId);

  const profileQ = useQuery({
    queryKey: ['rider', 'profile'],
    queryFn: async () => {
      const p = await fetchRiderProfile();
      setRider(p);
      return p;
    },
  });

  const availableQ = useQuery({
    queryKey: ['rider', 'available-orders'],
    queryFn: fetchAvailableOrders,
    enabled: Boolean(rider?.onlineStatus),
    refetchInterval: rider?.onlineStatus ? 10000 : false,
  });

  const acceptMut = useMutation({
    mutationFn: (orderId: string) => acceptOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rider'] });
      router.push('/(tabs)/orders');
    },
    onError: (e) => Alert.alert('Could not accept', e instanceof Error ? e.message : 'Try again'),
  });

  const activeOrderId = profileQ.data?.currentOrderId ?? rider?.currentOrderId;
  const available = (availableQ.data ?? []).filter((o) => o._id !== activeOrderId);

  if (!rider?.onlineStatus) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background, paddingBottom: tabBarHeight }]}>
        <View style={[styles.offlineIcon, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="cloud-offline-outline" size={40} color={theme.textSecondary} />
        </View>
        <ThemedText style={styles.centerTitle}>Go online first</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerSub}>
          Turn on online mode from Home to see delivery jobs near you.
        </ThemedText>
      </View>
    );
  }

  if (hasActive) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background, paddingBottom: tabBarHeight }]}>
        <View style={[styles.offlineIcon, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="bicycle" size={40} color={theme.primary} />
        </View>
        <ThemedText style={styles.centerTitle}>Finish current trip</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerSub}>
          Complete your active delivery before accepting a new job.
        </ThemedText>
        <ThemedText
          type="link"
          onPress={() => router.push('/(tabs)/orders')}
          style={{ marginTop: Spacing.three }}>
          Open active trip →
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScreenHeader
        title="Delivery jobs"
        subtitle={
          availableQ.isLoading
            ? 'Loading…'
            : `${available.length} job${available.length === 1 ? '' : 's'} ready to accept`
        }
      />

      <TabScrollView
        style={styles.flex1}
        refreshControl={
          <RefreshControl refreshing={availableQ.isRefetching} onRefresh={() => availableQ.refetch()} />
        }>
        {availableQ.isLoading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.four }} />
        ) : available.length > 0 ? (
          <View style={styles.list}>
            {available.map((item) => (
              <AvailableOrderCard
                key={item._id}
                order={item}
                busy={acceptMut.isPending}
                onAccept={() => acceptMut.mutate(item._id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.center}>
            <View style={[styles.offlineIcon, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name="time-outline" size={40} color={theme.textSecondary} />
            </View>
            <ThemedText style={styles.centerTitle}>No jobs right now</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.centerSub}>
              New offers appear when restaurants mark orders ready for pickup.
            </ThemedText>
          </View>
        )}
      </TabScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex1: { flex: 1 },
  list: { paddingHorizontal: Layout.screenPadding },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
    minHeight: 320,
  },
  offlineIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  centerTitle: { fontSize: 18, fontFamily: Fonts.extraBold, textAlign: 'center' },
  centerSub: { textAlign: 'center', marginTop: Spacing.two, maxWidth: 280, lineHeight: 20 },
});
