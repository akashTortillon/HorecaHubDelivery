import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import {screenType} from './DeliveryOrderListingScreen';
import {useIsFocused} from '@react-navigation/native';
import {fetchOrderHistory} from '../api/home/homeApi';

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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const isFocused = useIsFocused();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up and abort calls when leaving screen
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Reset and load when filter changes
  useEffect(() => {
    loadHistory(1, true);
  }, [activeFilter]);

  const loadHistory = async (pageNumber: number, isRefreshing: boolean = false) => {
    // 1. Check if we should exit early
    if (loading) return; 
    if (!isRefreshing && !hasMore) return;

    // 2. Abort any previous pending call before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      // Pass the signal to your API helper (ensure fetchOrderHistory accepts signal)
      const data = await fetchOrderHistory(activeFilter, pageNumber, {
        signal: abortControllerRef.current.signal,
      });

      if (data && data.length > 0) {
        setOrders(prev => (isRefreshing ? data : [...prev, ...data]));
        console.log('data is', data)
        setPage(pageNumber);
        setHasMore(data.length >= 15);
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.log('API Error:', error);
        // 3. CRITICAL: If the API fails, stop pagination to prevent infinite retries
        setHasMore(false); 
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    // Only trigger if not currently loading, and we confirmed more data exists
    if (!loading && hasMore) {
      loadHistory(page + 1);
    }
  };

  // UI Helper functions
  const handleDownload = (url: string | null) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  const getStatusStyle = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return {bg: '#dcfce7', text: '#22c55e'};
    if (s === 'returned' || s === 'damaged') return {bg: '#fee2e2', text: '#ef4444'};
    return {bg: '#f1f5f9', text: '#64748b'};
  };

  const renderOrderCard = ({item}: {item: any}) => {
    const statusColors = getStatusStyle(item?.status);
    const isDelivered = item.status?.toLowerCase() === 'delivered';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={styles.orderId}>{item.order_number}</Text>
            <Text style={styles.dateText}>{item.time_display}</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: statusColors.bg}]}>
            <Text style={[styles.statusText, {color: statusColors.text}]}>{item.status?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={[styles.row, {marginBottom: 8}]}>
          <Icon xml={SVG_ICONS.userIcon} size={14} color="#94a3b8" />
          <Text numberOfLines={2} style={styles.addressText}> {item.customer_name}</Text>
        </View>
        <View style={[styles.row, {marginBottom: 8}]}>
          <Icon xml={SVG_ICONS.locationIcon} size={14} color="#94a3b8" />
          <Text numberOfLines={2} style={styles.addressText}> {item.address_display}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.codText}>{item.is_cod ? `COD: AED ${item.cod_amount}` : `Paid: AED ${item.total_amount}`}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id, screenType: screenType.HISTORY })}
            style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon xml={SVG_ICONS.arrowRight} size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {isDelivered && (
          <View style={styles.downloadRow}>
            <TouchableOpacity 
              style={[styles.downloadBtn, !item.receipt_url && styles.disabledBtn]} 
              onPress={() => handleDownload(item.receipt_url)}
              disabled={!item.receipt_url}>
              <Icon xml={SVG_ICONS.downloadIcon} size={16} color={item.receipt_url ? "#475569" : "#cbd5e1"} />
              <Text style={[styles.downloadBtnText, !item.receipt_url && styles.disabledText]}>Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.downloadBtn, !item.invoice_url && styles.disabledBtn]} 
              onPress={() => handleDownload(item.invoice_url)}
              disabled={!item.invoice_url}>
              <Icon xml={SVG_ICONS.downloadIcon} size={16} color={item.invoice_url ? "#475569" : "#cbd5e1"} />
              <Text style={[styles.downloadBtnText, !item.invoice_url && styles.disabledText]}>Invoice</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                setOrders([]); // Clear current list visually
                setHasMore(true); // Allow fresh fetch
                setActiveFilter(filter);
              }}
              style={[styles.filterBtn, activeFilter === filter && styles.activeFilterBtn]}>
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listPadding}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
            loading ? <ActivityIndicator size="small" color="#2563eb" style={{marginVertical: 15}} /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon xml={SVG_ICONS.boxOutline} size={50} color="#cbd5e1" />
              <Text style={styles.emptyText}>No orders found.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

// ... Styles remain the same as previous response
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  filterWrapper: { backgroundColor: 'white', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  filterScroll: {paddingHorizontal: 16},
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  activeFilterBtn: {backgroundColor: '#3b82f6', borderColor: '#2563eb'},
  filterText: {color: '#64748b', fontWeight: '600', fontSize: 13},
  activeFilterText: {color: 'white'},
  listPadding: {padding: 16},
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId: {fontSize: 15, fontWeight: '800', color: '#1e293b'},
  dateText: {fontSize: 12, color: '#94a3b8', marginTop: 2},
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: {fontSize: 10, fontWeight: 'bold'},
  row: {flexDirection: 'row', alignItems: 'center', marginRight: 15},
  addressText: {color: '#64748b', fontSize: 13, flex: 1, lineHeight: 18},
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  codText: {color: '#1e293b', fontWeight: '700', fontSize: 13},
  viewDetailsBtn: { flexDirection: 'row', alignItems: 'center' },
  viewDetailsText: { color: '#2563eb', fontWeight: '700', fontSize: 13, marginRight: 4 },
  downloadRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 16 },
  downloadBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#f8fafc', height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', gap: 8 },
  disabledBtn: { backgroundColor: '#f1f5f9', borderColor: '#f1f5f9' },
  downloadBtnText: { color: '#475569', fontWeight: '700', fontSize: 13 },
  disabledText: { color: '#cbd5e1' },
  emptyContainer: {alignItems: 'center', marginTop: 100},
  emptyText: {marginTop: 10, color: '#94a3b8', fontSize: 14},
});

export default OrderHistory;