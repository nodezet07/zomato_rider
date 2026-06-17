import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  Switch,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '@/components/screen-header';
import { TabScrollView } from '@/components/tab-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { cardStyle, Layout } from '@/constants/layout';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUnreadNotificationCount } from '@/hooks/use-unread-notifications';
import { hasUploadedImage } from '@/lib/imageUtils';
import { emitRiderOnlineStatus } from '@/lib/riderSocketActions';
import {
  fetchDeliveryHistory,
  fetchEarningsSummary,
  fetchOrderById,
  fetchRiderEarnings,
  fetchRiderProfile,
  RIDER_FEE,
  updateRiderOnlineStatus,
} from '@/services/riders';
import { useRiderStore } from '@/stores/riderStore';

function StatTile({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.statTile, cardStyle, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="label" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText
        style={[
          styles.statValue,
          accent ? { color: theme.partner } : { color: theme.text },
        ]}>
        {value}
      </ThemedText>
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.statHint}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {action}
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const qc = useQueryClient();
  const rider = useRiderStore((s) => s.rider);
  const setRider = useRiderStore((s) => s.setRider);
  const unreadCount = useUnreadNotificationCount();

  const meQ = useQuery({
    queryKey: ['rider', 'me'],
    queryFn: () => import('@/services/riders').then((m) => m.fetchRiderMe()),
    staleTime: 60_000,
  });

  const profileQ = useQuery({
    queryKey: ['rider', 'profile'],
    queryFn: fetchRiderProfile,
  });

  const earningsQ = useQuery({
    queryKey: ['rider', 'earnings'],
    queryFn: fetchRiderEarnings,
  });

  const summaryQ = useQuery({
    queryKey: ['rider', 'earnings-summary'],
    queryFn: fetchEarningsSummary,
  });

  const historyQ = useQuery({
    queryKey: ['rider', 'history', 'home'],
    queryFn: () => fetchDeliveryHistory(1, 5),
  });

  const currentRider = profileQ.data ?? rider;
  const profileImage = meQ.data?.rider?.profileImage ?? meQ.data?.user?.profileImage;
  const activeOrderId = currentRider?.currentOrderId;

  const activeOrderQ = useQuery({
    queryKey: ['rider', 'active-order', activeOrderId],
    queryFn: () => fetchOrderById(activeOrderId!),
    enabled: Boolean(activeOrderId),
  });

  const onlineMut = useMutation({
    mutationFn: (online: boolean) => updateRiderOnlineStatus(online),
    onSuccess: (updated) => {
      setRider(updated);
      void emitRiderOnlineStatus(updated.onlineStatus);
      qc.invalidateQueries({ queryKey: ['rider'] });
    },
  });

  const earnings = earningsQ.data;
  const summary = summaryQ.data;
  const online = currentRider?.onlineStatus ?? false;
  const refreshing =
    profileQ.isRefetching || earningsQ.isRefetching || summaryQ.isRefetching || historyQ.isRefetching;

  const fullName = meQ.data?.user?.fullName ?? '';
  const greeting = fullName
    ? `Hi, ${fullName.split(' ')[0]}`
    : currentRider?.riderCode
    ? `Hi, ${currentRider.riderCode.split('-')[1] ?? currentRider.riderCode}`
    : 'Hi, Partner';

  return (
    <TabScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            profileQ.refetch();
            earningsQ.refetch();
            summaryQ.refetch();
            historyQ.refetch();
            if (activeOrderId) activeOrderQ.refetch();
          }}
        />
      }>
      <ScreenHeader
        title={greeting}
        subtitle="Your delivery dashboard"
        right={
          <View style={styles.headerRight}>
            {/* Bell */}
            <Pressable
              onPress={() => router.push('/notifications' as never)}
              style={[styles.iconCircle, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
              hitSlop={8}>
              <Ionicons name="notifications-outline" size={20} color={theme.text} />
              {unreadCount > 0 ? (
                <View style={[styles.bellBadge, { backgroundColor: theme.primary }]}>
                  <ThemedText style={styles.bellBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>

            {/* Online/Offline pill */}
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: online ? theme.partnerSoft : theme.backgroundElement,
                  borderColor: online ? theme.partner : theme.border,
                },
              ]}>
              <View style={[styles.statusDot, { backgroundColor: online ? theme.partner : theme.textSecondary }]} />
              <ThemedText style={[styles.statusPillText, { color: online ? theme.partner : theme.textSecondary }]}>
                {online ? 'Online' : 'Offline'}
              </ThemedText>
            </View>

            {/* Profile avatar */}
            <Pressable onPress={() => router.push('/(tabs)/profile')} hitSlop={8}>
              {hasUploadedImage(profileImage) ? (
                <Image source={{ uri: profileImage! }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons name="person" size={18} color={theme.primary} />
                </View>
              )}
            </Pressable>
          </View>
        }
      />

      {/* Go online */}
      <View style={[styles.card, cardStyle, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <ThemedText style={styles.cardTitle}>Go online</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.cardSub}>
              {online
                ? 'You are visible for new delivery requests'
                : 'Turn on to start receiving orders'}
            </ThemedText>
          </View>
          {onlineMut.isPending ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Switch
              value={online}
              onValueChange={(v) => onlineMut.mutate(v)}
              trackColor={{ false: theme.border, true: theme.partnerSoft }}
              thumbColor={online ? theme.partner : theme.backgroundElement}
            />
          )}
        </View>
      </View>

      {/* Analytics KPIs — 2×2 grid */}
      <View style={styles.statsGrid}>
        <StatTile
          label="Today"
          value={`₹${earnings?.todayEarnings ?? 0}`}
          hint="Earnings today"
          accent
        />
        <StatTile
          label="All time"
          value={`₹${earnings?.totalEarnings ?? 0}`}
          hint="Total earnings"
        />
        <StatTile
          label="Deliveries"
          value={`${earnings?.totalDeliveries ?? currentRider?.totalDeliveries ?? 0}`}
          hint="Completed"
        />
        <StatTile
          label="Pending"
          value={`₹${summary?.pendingPayout?.grossEarnings ?? 0}`}
          hint={`${summary?.pendingPayout?.deliveryCount ?? 0} unpaid`}
        />
      </View>

      {/* Active delivery */}
      {activeOrderId ? (
        <View style={styles.section}>
          <SectionHeader
            title="Active delivery"
            action={
              <Pressable onPress={() => router.push(`/order/${activeOrderId}` as never)}>
                <ThemedText type="link">Open</ThemedText>
              </Pressable>
            }
          />
          <Pressable
            onPress={() => router.push(`/order/${activeOrderId}` as never)}
            style={[styles.activeBanner, cardStyle, { backgroundColor: theme.primarySoft }]}>
            {activeOrderQ.isLoading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <>
                <View style={styles.activeTop}>
                  <ThemedText style={styles.activeOrderId}>
                    #
                    {activeOrderQ.data?.orderNumber ??
                      activeOrderId.slice(-6).toUpperCase()}
                  </ThemedText>
                  <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                    <ThemedText style={styles.activeBadgeText}>
                      {(activeOrderQ.data?.orderStatus ?? 'ACTIVE').replace(/_/g, ' ')}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 6 }}>
                  Tap to continue delivery · ₹{RIDER_FEE} on completion
                </ThemedText>
              </>
            )}
          </Pressable>
        </View>
      ) : null}

      {/* Quick actions */}
      <View style={styles.section}>
        <SectionHeader title="Quick actions" />
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => router.push('/(tabs)/jobs')}
            style={[styles.actionBtn, cardStyle, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={styles.actionLabel}>Jobs</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Accept deliveries
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/orders')}
            style={[styles.actionBtn, cardStyle, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={styles.actionLabel}>Trip</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Active delivery
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/earnings')}
            style={[styles.actionBtn, cardStyle, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={styles.actionLabel}>Earnings</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Payouts
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Recent deliveries */}
      <View style={styles.section}>
        <SectionHeader
          title="Recent deliveries"
          action={
            <Pressable onPress={() => router.push('/(tabs)/earnings')}>
              <ThemedText type="link">See all</ThemedText>
            </Pressable>
          }
        />
        <View style={[styles.listCard, cardStyle, { backgroundColor: theme.backgroundElement }]}>
          {historyQ.isLoading ? (
            <ActivityIndicator color={theme.primary} style={{ paddingVertical: Spacing.three }} />
          ) : (historyQ.data?.orders ?? []).length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              No completed deliveries yet. Go online and accept your first order.
            </ThemedText>
          ) : (
            (historyQ.data?.orders ?? []).map((o, i, arr) => (
              <View
                key={o._id}
                style={[
                  styles.listRow,
                  i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                ]}>
                <View style={styles.flex1}>
                  <ThemedText style={styles.listPrimary}>
                    #{o.orderNumber ?? o._id.slice(-6).toUpperCase()}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {typeof o.restaurantId === 'object'
                      ? o.restaurantId?.restaurantName ?? 'Restaurant'
                      : 'Restaurant'}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.listAmount, { color: theme.partner }]}>
                  +₹{RIDER_FEE}
                </ThemedText>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Primary CTA */}
      <Pressable
        onPress={() => router.push(activeOrderId ? '/(tabs)/orders' : '/(tabs)/jobs')}
        style={[styles.cta, { backgroundColor: theme.primary }]}>
        <ThemedText style={styles.ctaText}>
          {!online
            ? 'Go online to see jobs'
            : activeOrderId
              ? 'Continue active trip'
              : 'Browse delivery jobs'}
        </ThemedText>
      </Pressable>

      {profileQ.isLoading && !currentRider ? (
        <ActivityIndicator style={{ marginTop: Spacing.three }} color={theme.primary} />
      ) : null}
    </TabScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex1: { flex: 1 },
  card: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.two,
    padding: Spacing.three,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  cardTitle: { fontSize: 15, fontFamily: Fonts.extraBold },
  cardSub: { marginTop: 4 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusPillText: { fontSize: 11, fontFamily: Fonts.bold, textTransform: 'uppercase' },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: Fonts.bold,
    lineHeight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.two,
  },
  statTile: {
    width: '47.5%',
    flexGrow: 1,
    minHeight: 96,
    padding: Spacing.three,
    justifyContent: 'space-between',
  },
  statValue: { fontSize: 22, fontFamily: Fonts.extraBold, marginTop: Spacing.one },
  statHint: { marginTop: 2 },
  section: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  sectionTitle: { fontSize: 14, fontFamily: Fonts.extraBold },
  activeBanner: { padding: Spacing.three },
  activeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activeOrderId: { fontSize: 18, fontFamily: Fonts.extraBold },
  activeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  activeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
  },
  actionsRow: { flexDirection: 'row', gap: Spacing.two },
  actionBtn: {
    flex: 1,
    padding: Spacing.two,
    minHeight: 72,
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 13, fontFamily: Fonts.extraBold, marginBottom: 2 },
  listCard: { overflow: 'hidden' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  listPrimary: { fontSize: 13, fontFamily: Fonts.bold },
  listAmount: { fontSize: 14, fontFamily: Fonts.extraBold },
  emptyText: { padding: Spacing.three, textAlign: 'center' },
  cta: {
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.one,
    borderRadius: Layout.buttonRadius,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontFamily: Fonts.extraBold, fontSize: 15 },
});
