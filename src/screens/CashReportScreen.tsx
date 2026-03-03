import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { fetchCashReport } from '../api/home/homeApi';

const CashInHandScreen = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCashData();
  }, []);

  const loadCashData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await fetchCashReport('today');
      setReportData(data);
    } catch (error) {
      console.log('Error loading cash report', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCashData();
  };

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.transactionItem}>
      <View>
        <Text style={styles.orderId}>{item.order_number}</Text>
        <Text style={styles.dateText}>{item.date_display}</Text>
      </View>
      <Text style={styles.amountText}>+AED {item.amount_received}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <View style={styles.content}>
          {/* Total Cash Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Cash in Hand</Text>
            <Text style={styles.totalAmount}>
              AED {reportData?.total_cash?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.transactionCount}>
              {reportData?.transaction_count || 0} cash transaction(s)
            </Text>
          </View>

          {/* Transaction Details List */}
          <View style={styles.listContainer}>
            <Text style={styles.listHeader}>Transaction Details</Text>

            <FlatList
              data={reportData?.transactions || []}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#7C3AED']}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No cash transactions recorded for today.
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    flex: 1,
  },
  totalCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  totalLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
  },
  transactionCount: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  listHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CashInHandScreen;
