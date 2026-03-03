import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
// Integrated real API call
import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import {screenType} from './DeliveryOrderListingScreen';
import {useIsFocused} from '@react-navigation/native';
import { fetchOrderHistory } from '../api/home/homeApi';

const FILTERS = [
  'All Time',
  'This Month',
  'Today',
  'Delivered',
  'Not Delivered',
  'Returned',
  'Damaged',
];

const OrderHistory = ({navigation, route}: any) => {
  const [activeFilter, setActiveFilter] = useState(
    route.params?.initialFilter || 'All Time',
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    loadHistory();
  }, [activeFilter]);

  useEffect(() => {
    if (route.params?.initialFilter && isFocused) {
      setActiveFilter(route.params.initialFilter);
    }
  }, [route.params?.initialFilter, isFocused]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchOrderHistory(activeFilter);
      setOrders(data);
    } catch (error) {
      console.log('Error loading history', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return {bg: '#dcfce7', text: '#22c55e'};
    if (s === 'returned' || s === 'damaged')
      return {bg: '#fee2e2', text: '#ef4444'};
    return {bg: '#f1f5f9', text: '#64748b'};
  };

  const renderOrderCard = ({item}: {item: any}) => {
    const statusColors = getStatusStyle(item?.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={styles.orderId}>{item.order_number}</Text>
            <Text style={styles.dateText}>{item.time_display}</Text>
          </View>
          <View
            style={[styles.statusBadge, {backgroundColor: statusColors.bg}]}>
            <Text style={[styles.statusText, {color: statusColors.text}]}>
              {item.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.row, {marginBottom: 8}]}>
          <Icon xml={SVG_ICONS.locationIcon} size={14} color="#94a3b8" />
          <Text numberOfLines={2} style={styles.addressText}>
            {' '}
            {item.address_display}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.row}>
            <Icon xml={SVG_ICONS.dollarIcon} size={14} color="#22c55e" />
            <Text style={styles.codText}>
              {item.is_cod
                ? `COD: AED ${item.cod_amount}`
                : `Paid: AED ${item.total_amount}`}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('OrderDetails', {
                orderId: item.id, // Passing ID to fetch details in next screen
                screenType: screenType.HISTORY,
              })
            }
            style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon xml={SVG_ICONS.arrowRight} size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterBtn,
                activeFilter === filter && styles.activeFilterBtn,
              ]}>
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText,
                ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          {/* <Text style={styles.loaderText}>Fetching History...</Text> */}
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon xml={SVG_ICONS.boxOutline} size={50} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                No orders found for this period.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  filterWrapper: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterScroll: {paddingHorizontal: 16},
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilterBtn: {backgroundColor: '#3b82f6', borderColor: '#2563eb'},
  filterText: {color: '#64748b', fontWeight: '600', fontSize: 13},
  activeFilterText: {color: 'white'},
  listPadding: {padding: 16},
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {fontSize: 15, fontWeight: '800', color: '#1e293b'},
  dateText: {fontSize: 12, color: '#94a3b8', marginTop: 2},
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {fontSize: 10, fontWeight: 'bold'},
  row: {flexDirection: 'row', alignItems: 'center', marginRight: 15},
  addressText: {color: '#64748b', fontSize: 13, flex: 1, lineHeight: 18},
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  codText: {color: '#1e293b', fontWeight: '700', fontSize: 13},
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 13,
    marginRight: 4,
  },
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loaderText: {marginTop: 10, color: '#64748b', fontSize: 14},
  emptyContainer: {alignItems: 'center', marginTop: 100},
  emptyText: {marginTop: 10, color: '#94a3b8', fontSize: 14},
});

export default OrderHistory;
