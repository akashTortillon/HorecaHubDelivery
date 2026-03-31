import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import {useIsFocused} from '@react-navigation/native';
import {fetchActiveOrders, fetchAssignments} from '../api/home/homeApi';

export enum screenType {
  HISTORY = 'History',
  NEW = 'New',
}

const OrderListing = ({navigation, route}: any) => {
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'new');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  // Load data on tab change or screen focus
  useEffect(() => {
    if (isFocused) {
      loadOrders();
    }
  }, [activeTab, isFocused]);

  // Handle deep linking/params from other screens
  useEffect(() => {
    if (route.params?.initialTab && isFocused) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab, isFocused]);

  const loadOrders = async () => {
    if (!refreshing) setLoading(true);
    try {
      const data =
        activeTab === 'new'
          ? await fetchAssignments()
          : await fetchActiveOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Order Load Error:', error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  console.log('order items is', orders)

  const renderBadge = (status: string) => {
    let bgColor = '#8b5cf6';
    const displayStatus = status?.replace(/_/g, ' ').toUpperCase() || 'PENDING';

    if (status === 'out_for_delivery') bgColor = '#f97316';
    if (status === 'picked_up') bgColor = '#facc15';
    if (status === 'delivered') bgColor = '#22c55e'; // Added Delivered status
    if (status === 'ready_to_ship' || status === 'scheduled')
      bgColor = '#3b82f6';

    return (
      <View style={[styles.badge, {backgroundColor: bgColor}]}>
        <Text style={styles.badgeText}>{displayStatus}</Text>
      </View>
    );
  };


  const renderOrderCard = ({item}: {item: any}) => {
    const isActive = activeTab === 'active';
    const currentStatus = item.delivery_status || item.status;
    const isDelivered = currentStatus === 'delivered'; //

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.orderId}>{item.order_number}</Text>
            <Text style={styles.dateText}>{new Date(item.order_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}
  {item.time_display ? ` | ${item.time_display}` : ''}</Text>
          </View>
          <View style={styles.badgeContainer}>
            {isActive ? (
              renderBadge(currentStatus)
            ) : (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.customerName}>
          {item.customer_name || 'Horeca Customer'}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.row}>
            <Icon xml={SVG_ICONS.locationIcon} size={14} color="#94a3b8" />
            <Text numberOfLines={1} style={styles.infoText}>
              {item.address_display}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.row}>
            <Icon xml={SVG_ICONS.boxOutline} size={14} color="#94a3b8" />
            <Text style={styles.infoText}> {item.weight || 'Standard'}</Text>
          </View>
          <Text style={styles.codText}>
            {item.is_cod
              ? `COD: ${item.cod_amount}`
              : `Paid: ${item.total_amount}`}
          </Text>
          <View style={styles.row}>
            <Icon xml={SVG_ICONS.warningIcon} size={14} color="#ef4444" />
            <Text style={styles.instructionText}>Instructions</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsLink}
          onPress={() =>
            navigation.navigate(
              isActive ? 'ActiveOrderDetails' : 'OrderDetails',
              {
                orderId: item.id,
                screenType: isActive ? undefined : screenType.NEW,
              },
            )
          }>
          <Text style={styles.viewDetailsText}>View Details {'>'}</Text>
        </TouchableOpacity>

        {/* Dynamic Action Buttons based on status */}
        {isDelivered ? (
          <View style={styles.downloadRow}>
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={() => console.log('Download Receipt')}>
              <Icon
                xml={SVG_ICONS.downloadIcon || SVG_ICONS.noteIcon}
                size={16}
                color="#475569"
              />
              <Text style={styles.downloadBtnText}>Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={() => console.log('Download Invoice')}>
              <Icon
                xml={SVG_ICONS.downloadIcon || SVG_ICONS.noteIcon}
                size={16}
                color="#475569"
              />
              <Text style={styles.downloadBtnText}>Invoice</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate(
                isActive ? 'ActiveOrderDetails' : 'OrderDetails',
                {
                  orderId: item.id,
                  screenType: isActive ? undefined : screenType.NEW,
                },
              )
            }>
            <Text style={styles.actionButtonText}>
              {isActive
                ? currentStatus === 'scheduled' ||
                  currentStatus === 'ready_to_ship'
                  ? 'Pickup Package'
                  : 'Continue Delivery'
                : 'View & Accept Order'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'new' && styles.activeTab]}
          onPress={() => setActiveTab('new')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'new' && styles.activeTabText,
            ]}>
            Assignments ({activeTab === 'new' ? orders.length : '...'})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.activeTabText,
            ]}>
            Active Deliveries ({activeTab === 'active' ? orders.length : '...'})
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={item => item.id}
          contentContainerStyle={{padding: 16}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon xml={SVG_ICONS.boxOutline} size={50} color="#cbd5e1" />
              <Text style={styles.emptyText}>No {activeTab} orders found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {borderBottomColor: '#2563eb'},
  tabText: {fontWeight: '700', color: '#64748b', fontSize: 13},
  activeTabText: {color: '#2563eb'},
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badgeContainer: {alignItems: 'flex-end'},
  orderId: {fontSize: 16, fontWeight: '800', color: '#1e293b'},
  dateText: {fontSize: 12, color: '#64748b', marginTop: 2},
  newBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    borderRadius: 6,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadgeText: {color: 'white', fontSize: 10, fontWeight: '900'},
  badge: {
    paddingHorizontal: 10,
    borderRadius: 6,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {color: 'white', fontSize: 9, fontWeight: '900'},
  customerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  infoRow: {marginBottom: 10},
  row: {flexDirection: 'row', alignItems: 'center'},
  infoText: {color: '#64748b', fontSize: 14, marginLeft: 5},
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  codText: {color: '#22c55e', fontWeight: '800', fontSize: 14},
  instructionText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  viewDetailsLink: {alignSelf: 'flex-end', marginVertical: 12},
  viewDetailsText: {color: '#2563eb', fontWeight: '700', fontSize: 14},
  actionButton: {
    backgroundColor: '#3b82f6',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {color: 'white', fontWeight: '800', fontSize: 16},

  // Download Row Styles
  downloadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  downloadBtnText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 14,
  },

  emptyContainer: {alignItems: 'center', marginTop: 80},
  emptyText: {
    color: '#94a3b8',
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default OrderListing;
