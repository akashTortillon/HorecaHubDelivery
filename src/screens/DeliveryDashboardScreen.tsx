import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
// Integrated API calls

import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import {useToast} from '../utilities/ToastContext';
import {
  fetchAgentDashboard,
  fetchAgentRankings,
  fetchAgentProfile,
} from '../api/home/homeApi';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const Dashboard = ({navigation}: any) => {
  const [data, setData] = useState<any>(null);
  const [ranks, setRanks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const {showToast} = useToast();
  const [showRanks, setShowRanks] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Parallel API calls for better performance
      const [dashboardRes, rankingsRes] = await Promise.all([
        fetchAgentDashboard(),
        fetchAgentRankings(),
        // fetchAgentProfile(),
      ]);

      setData(dashboardRes);
      setRanks(rankingsRes);
      // setProfile(profileRes);
    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get initials for avatar
  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)
      : '??';
  };

  if (loading || !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Top Summary Row */}
        <View style={styles.row}>
          <SummaryCard
            title="Active Deliveries"
            value={data.active_deliveries_count}
            color="#3b82f6"
            icon={SVG_ICONS.truckIcon}
          />
          <SummaryCard
            title="Completed Today"
            value={data.completed_today_count}
            color="#22c55e"
            icon={SVG_ICONS.tickIcon}
          />
        </View>
        <View style={styles.row}>
          <SummaryCard
            title="Pending Pickups"
            value={data.pending_pickups_count}
            color="#f59e0b"
            icon={SVG_ICONS.pendingIcon}
          />
          <SummaryCard
            title="Total Cash in Hand"
            value={`AED ${data.total_cash_in_hand}`}
            color="#8b5cf6"
            isCash
            icon={SVG_ICONS.dollarIcon}
          />
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <View style={{flexDirection: 'row', gap: 5}}>
            <Icon xml={SVG_ICONS.graphUpIcon} color="#06b6d4" size={20} />
            <Text style={styles.sectionTitle}> Performance Metrics</Text>
          </View>
          <View style={styles.cardGrid}>
            <MetricCard
              title="TODAY'S REVENUE"
              value={`AED ${data.todays_revenue}`}
              subValue={`${data.completed_today_count} orders`}
              color="#a855f7"
              onPress={() => {
                navigation.navigate('DeliveryHistory', {
                  initialFilter: 'Today',
                });
              }}
            />
            <MetricCard
              title="MONTH'S REVENUE"
              value={`AED ${data.months_revenue}`}
              subValue="Current Month"
              color="#06b6d4"
              onPress={() => {
                navigation.navigate('DeliveryHistory', {
                  initialFilter: 'This Month',
                });
              }}
            />
            <MetricCard
              title="TOTAL DELIVERIES"
              value={profile?.total_orders_delivered || 0}
              subValue="Lifetime"
              color="#10b981"
              onPress={() => {
                navigation.navigate('DeliveryHistory', {
                  initialFilter: 'All',
                });
              }}
            />
            <MetricCard
              title="GLOBAL RANK"
              value={`#${
                ranks.find(r => r.full_name === profile?.full_name)?.rank ||
                '--'
              }`}
              subValue={`Rating: ${data.customer_rating}`}
              color="#f97316"
              onPress={() => {
                setShowRanks(true);
              }}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <ActionButton
              label="New Delivery"
              badge={
                data.pending_pickups_count > 0
                  ? data.pending_pickups_count
                  : null
              }
              color="#4f46e5"
              icon={SVG_ICONS.plusIcon}
              onPress={() => {
                navigation.navigate('Orders', {initialTab: 'new'});
              }}
            />
            <ActionButton
              label="Active"
              badge={
                data.active_deliveries_count > 0
                  ? data.active_deliveries_count
                  : null
              }
              color="#10b981"
              icon={SVG_ICONS.returnIcon}
              onPress={() => {
                navigation.navigate('Orders', {initialTab: 'active'});
              }}
            />
            <ActionButton
              label="Delivery OTP"
              color="#f59e0b"
              icon={SVG_ICONS.shieldIcon}
              onPress={() => {
                showToast(
                  'Please select an active delivery to enter OTP',
                  'info',
                );
                navigation.navigate('Orders', {initialTab: 'active'});
              }}
            />
            <ActionButton
              label="Out for Delivery"
              color="#0ea5e9"
              icon={SVG_ICONS.sendIcon}
              onPress={() => {
                navigation.navigate('Orders', {initialTab: 'active'});
              }}
            />
            <ActionButton
              label="Report Issue"
              color="#ef4444"
              icon={SVG_ICONS.warningIcon}
              onPress={() => {
                showToast(
                  'Please select an active delivery to report an issue',
                  'info',
                );
                navigation.navigate('Orders', {initialTab: 'active'});
              }}
            />
          </View>
        </View>

        {/* Banner */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Orders', {initialTab: 'new'});
          }}
          style={styles.banner}>
          <View>
            <Text style={styles.bannerTitle}>Performance Score</Text>
            <Text style={styles.bannerSub}>
              Your on-time delivery rate is {data.on_time_delivery_pct}%. Keep
              it up!
            </Text>
          </View>
          <Icon xml={SVG_ICONS.arrowRight} color="white" />
        </TouchableOpacity>

        {/* Menu List */}
        <View style={styles.menuContainer}>
          <MenuItem
            title="Delivery History"
            onPress={() => {
              navigation.navigate('DeliveryHistory');
            }}
          />
          <MenuItem title="Issues & Returns" onPress={()=>{
             showToast(
               'Please select an active delivery to report an issue',
               'info',
             );
             navigation.navigate('Orders', {initialTab: 'active'});
          }} />
          <MenuItem title="Support Chat" noBorder />
        </View>
      </ScrollView>

      {/* Ranks Popup Modal */}
      <Modal
        visible={showRanks}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRanks(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowRanks(false)}>
                <Icon
                  xml={
                    SVG_ICONS.closeIcon ||
                    `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white"/></svg>`
                  }
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
              <View style={styles.trophyBadge}>
                <Icon
                  xml={
                    SVG_ICONS.trophyIcon ||
                    `<svg viewBox="0 0 24 24"><path d="M18 2H6v2H2v6c0 2.21 1.79 4 4 4h1.09c.43 1.54 1.55 2.79 3.01 3.42L9 22h6l-1.1-4.58c1.46-.63 2.58-1.88 3.01-3.42H18c2.21 0 4-1.79 4-4V4h-4V2z" fill="#facc15"/></svg>`
                  }
                  size={40}
                />
              </View>
              <Text style={styles.modalTitle}>Top Performers</Text>
              <Text style={styles.modalSubtitle}>GLOBAL RANKINGS</Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalList}
              showsVerticalScrollIndicator={false}>
              {ranks.map((item, index) => {
                const isMe = item.full_name === profile?.full_name;
                const rankColor =
                  item.rank === 1
                    ? '#facc15'
                    : item.rank === 2
                    ? '#94a3b8'
                    : item.rank === 3
                    ? '#d97706'
                    : '#3b82f6';

                return (
                  <View
                    key={index}
                    style={[styles.rankRow, isMe && styles.rankRowMe]}>
                    <View style={styles.rankLeftSection}>
                      <View
                        style={[
                          styles.rankNumBadge,
                          {backgroundColor: rankColor},
                        ]}>
                        <Text style={styles.rankNumText}>{item.rank}</Text>
                      </View>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {getInitials(item.full_name)}
                        </Text>
                      </View>
                      <View style={{flexShrink: 1}}>
                        <Text
                          numberOfLines={1}
                          style={[styles.rankName, isMe && {color: '#2563eb'}]}>
                          {item.full_name} {isMe ? '(You)' : ''}{' '}
                          {item.rank === 1 && '👑'}
                        </Text>
                        <Text style={styles.rankStat}>
                          ⭐ {item.customer_rating} RATING
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rankRightSection}>
                      <Text style={styles.rankValue}>
                        {item.total_orders_delivered}
                      </Text>
                      <Text style={styles.rankUnit}>ORDERS</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowRanks(false)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- Sub-Components (SummaryCard, MetricCard, ActionButton, MenuItem) ---
// Note: Kept exactly as provided in original request

const SummaryCard = ({title, value, color, icon}: any) => (
  <View style={[styles.summaryCard, {backgroundColor: color}]}>
    <View
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
      }}>
      <Icon xml={icon} size={20} color="white" />
    </View>
    <View style={styles.textContainer}>
      <Text numberOfLines={2} style={styles.summaryTitle}>
        {title}
      </Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.summaryValue}>
        {value}
      </Text>
    </View>
  </View>
);

const MetricCard = ({title, value, subValue, color, onPress}: any) => (
  <Pressable
    onPress={onPress}
    style={[styles.metricCard, {backgroundColor: color}]}>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    <View style={styles.metricBadge}>
      <Text style={styles.metricBadgeText}>{subValue}</Text>
    </View>
  </Pressable>
);

const ActionButton = ({label, badge, color, icon, onPress}: any) => (
  <TouchableOpacity onPress={onPress} style={styles.actionItem}>
    <View style={[styles.actionIconBox, {backgroundColor: color}]}>
      {badge && (
        <View style={styles.actionBadge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Icon xml={icon} size={24} color="white" />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const MenuItem = ({title, noBorder, onPress}: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.menuItem, noBorder && {borderBottomWidth: 0}]}>
    <Text style={styles.menuText}>{title}</Text>
    <Icon xml={SVG_ICONS.arrowRight} color="#334155" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  scrollContent: {padding: 16},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    margin: 6,
    padding: 14,
    borderRadius: 16,
    minHeight: 130,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  textContainer: {flexShrink: 1},
  summaryTitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  summaryValue: {color: 'white', fontSize: 18, fontWeight: '800', marginTop: 4},
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    height: 110,
  },
  metricTitle: {color: 'white', fontSize: 10, fontWeight: '700', opacity: 0.9},
  metricValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 8,
  },
  metricBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  metricBadgeText: {color: 'white', fontSize: 10, fontWeight: '600'},
  actionGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  actionItem: {width: '30%', alignItems: 'center', marginBottom: 16},
  actionIconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    color: '#475569',
    fontWeight: '600',
  },
  actionBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {color: 'white', fontSize: 10, fontWeight: 'bold'},
  banner: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerTitle: {color: 'white', fontWeight: 'bold', fontSize: 16},
  bannerSub: {color: 'rgba(255,255,255,0.8)', fontSize: 12},
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuText: {fontSize: 15, color: '#334155', fontWeight: '500'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {backgroundColor: '#4f46e5', padding: 30, alignItems: 'center'},
  modalClose: {position: 'absolute', top: 15, right: 15},
  trophyBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {color: 'white', fontSize: 22, fontWeight: '800'},
  modalSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  modalList: {padding: 16},
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  rankRowMe: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  rankLeftSection: {flexDirection: 'row', alignItems: 'center', flex: 1},
  rankNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rankNumText: {color: 'white', fontSize: 11, fontWeight: 'bold'},
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {color: '#64748b', fontSize: 13, fontWeight: 'bold'},
  rankName: {fontSize: 14, fontWeight: '700', color: '#1e293b'},
  rankStat: {fontSize: 10, color: '#94a3b8', fontWeight: '600'},
  rankRightSection: {alignItems: 'flex-end', marginLeft: 10},
  rankValue: {fontSize: 16, fontWeight: '800', color: '#1e293b'},
  rankUnit: {fontSize: 8, fontWeight: '700', color: '#94a3b8'},
  modalCloseBtn: {
    margin: 16,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalCloseBtnText: {color: '#475569', fontWeight: '700', fontSize: 16},
});

export default Dashboard;
