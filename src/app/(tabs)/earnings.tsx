import { useQuery } from '@tanstack/react-query';
import { View, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '@/components/screen-header';
import { TabScrollView } from '@/components/tab-scroll-view';

import { ThemedText } from '@/components/themed-text';
import { cardStyle, Layout } from '@/constants/layout';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { orderDisplayId } from '@/lib/orderDisplay';
import {
  fetchDeliveryHistory,
  fetchEarningsSummary,
  fetchPayoutHistory,
  fetchRiderEarnings,
  RIDER_FEE,
} from '@/services/riders';

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatPayoutStatus(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function EarningsScreen() {
  const theme = useTheme();

  const earningsQ = useQuery({ queryKey: ['rider', 'earnings'], queryFn: fetchRiderEarnings });
  const summaryQ = useQuery({ queryKey: ['rider', 'earnings-summary'], queryFn: fetchEarningsSummary });
  const historyQ = useQuery({
    queryKey: ['rider', 'history'],
    queryFn: () => fetchDeliveryHistory(1, 30),
  });
  const payoutsQ = useQuery({
    queryKey: ['rider', 'payouts'],
    queryFn: () => fetchPayoutHistory(1, 10),
  });

  const earnings = earningsQ.data;
  const summary = summaryQ.data;
  const history = historyQ.data?.orders ?? [];
  const payouts = payoutsQ.data?.payouts ?? [];
  const refreshing =
    historyQ.isRefetching || earningsQ.isRefetching || summaryQ.isRefetching || payoutsQ.isRefetching;

  const pendingAmount = summary?.pendingPayout?.grossEarnings ?? 0;
  const paidAmount = summary?.totalPaidOut?.grossEarnings ?? 0;
  const unpaidCount = summary?.pendingPayout?.deliveryCount ?? 0;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <TabScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              historyQ.refetch();
              earningsQ.refetch();
              summaryQ.refetch();
              payoutsQ.refetch();
            }}
          />
        }>
        <ScreenHeader
          title="Earnings"
          subtitle={`₹${RIDER_FEE} per completed delivery`}
        />

        <LinearGradient
          colors={[Brand.orange, '#ff7a33']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <ThemedText style={styles.heroLabel}>Today&apos;s earnings</ThemedText>
              <ThemedText style={styles.heroAmount}>₹{earnings?.todayEarnings ?? 0}</ThemedText>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="wallet" size={28} color="#fff" />
            </View>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <ThemedText style={styles.heroMetaValue}>₹{earnings?.totalEarnings ?? 0}</ThemedText>
              <ThemedText style={styles.heroMetaLabel}>All time</ThemedText>
            </View>
            <View style={styles.heroMetaDivider} />
            <View style={styles.heroMetaItem}>
              <ThemedText style={styles.heroMetaValue}>{earnings?.totalDeliveries ?? 0}</ThemedText>
              <ThemedText style={styles.heroMetaLabel}>Trips</ThemedText>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, cardStyle, { backgroundColor: theme.backgroundElement }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="hourglass-outline" size={18} color={theme.primary} />
            </View>
            <ThemedText type="label" themeColor="textSecondary">
              Pending payout
            </ThemedText>
            <ThemedText style={[styles.statAmount, { color: theme.primary }]}>₹{pendingAmount}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {unpaidCount} unpaid {unpaidCount === 1 ? 'delivery' : 'deliveries'}
            </ThemedText>
          </View>

          <View style={[styles.statCard, cardStyle, { backgroundColor: theme.backgroundElement }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.partnerSoft }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={theme.partner} />
            </View>
            <ThemedText type="label" themeColor="textSecondary">
              Paid out
            </ThemedText>
            <ThemedText style={[styles.statAmount, { color: theme.partner }]}>₹{paidAmount}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Total transferred
            </ThemedText>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <ThemedText style={styles.sectionTitle}>Recent deliveries</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Last 30 trips
          </ThemedText>
        </View>

        {historyQ.isLoading ? (
          <ActivityIndicator color={theme.primary} style={{ marginVertical: Spacing.three }} />
        ) : history.length ? (
          <View style={[styles.listCard, cardStyle, { backgroundColor: theme.backgroundElement }]}>
            {history.map((item, i) => (
              <View
                key={item._id}
                style={[
                  styles.historyRow,
                  i < history.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                ]}>
                <View style={[styles.tripIcon, { backgroundColor: theme.partnerSoft }]}>
                  <Ionicons name="bicycle" size={18} color={theme.partner} />
                </View>
                <View style={styles.historyLeft}>
                  <ThemedText style={styles.historyId}>{orderDisplayId(item)}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {typeof item.restaurantId === 'object'
                      ? item.restaurantId?.restaurantName ?? 'Delivery'
                      : 'Delivery'}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.historyEarn, { color: theme.partner }]}>+₹{RIDER_FEE}</ThemedText>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.empty, cardStyle, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="receipt-outline" size={32} color={theme.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No deliveries yet</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptySub}>
              Go online and accept jobs to start earning.
            </ThemedText>
          </View>
        )}

        {payouts.length > 0 ? (
          <>
            <View style={styles.sectionHead}>
              <ThemedText style={styles.sectionTitle}>Payout history</ThemedText>
            </View>
            <View style={[styles.listCard, cardStyle, { backgroundColor: theme.backgroundElement }]}>
              {payouts.map((p, i) => (
                <View
                  key={p._id}
                  style={[
                    styles.historyRow,
                    i < payouts.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                  ]}>
                  <View style={[styles.tripIcon, { backgroundColor: theme.primarySoft }]}>
                    <Ionicons name="cash-outline" size={18} color={theme.primary} />
                  </View>
                  <View style={styles.historyLeft}>
                    <ThemedText style={styles.historyId}>₹{p.amount}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatPayoutStatus(p.status)}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatDate(p.paidAt)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </TabScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroCard: {
    marginHorizontal: Layout.screenPadding,
    borderRadius: Layout.cardRadius,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  heroAmount: {
    color: '#fff',
    fontSize: 36,
    fontFamily: Fonts.extraBold,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.three,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroMetaItem: { flex: 1, alignItems: 'center' },
  heroMetaDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroMetaValue: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Fonts.extraBold,
  },
  heroMetaLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: Fonts.medium,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.three,
  },
  statCard: {
    flex: 1,
    padding: Spacing.three,
    minHeight: 120,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  statAmount: {
    fontSize: 22,
    fontFamily: Fonts.extraBold,
    marginTop: 4,
    marginBottom: 2,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  listCard: {
    marginHorizontal: Layout.screenPadding,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    gap: Spacing.two,
  },
  tripIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyLeft: { flex: 1, minWidth: 0 },
  historyId: { fontSize: 14, fontFamily: Fonts.bold },
  historyEarn: { fontSize: 15, fontFamily: Fonts.extraBold },
  empty: {
    marginHorizontal: Layout.screenPadding,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.one,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    marginTop: Spacing.one,
  },
  emptySub: { textAlign: 'center' },
});
