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
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import {fetchCashReport, fetchCreditNotes} from '../api/home/homeApi';

const TIME_FILTERS = [
  {label: 'Today', key: 'today'},
  {label: 'This Month', key: 'this_month'},
  {label: 'All Time', key: 'all_time'},
];

const CashInHandScreen = ({navigation}: any) => {
  const [activeFilter, setActiveFilter] = useState('today');
  const [reportData, setReportData] = useState<any>(null);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [activeFilter]);

  const loadAllData = async () => {
    try {
      if (!refreshing) setLoading(true);
      // fetchCashReport now uses the activeFilter key (today | this_month | all_time)
      const [cashData, creditData] = await Promise.all([
        fetchCashReport(activeFilter),
        fetchCreditNotes(),
      ]);
      setReportData(cashData);
      setCreditNotes(creditData?.results?.data || []);
    } catch (error) {
      console.log('Error loading data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const handleOpenPdf = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load PDF", err));
    }
  };

  const renderTransaction = ({item}: {item: any}) => (
    <View style={styles.transactionItem}>
      <View>
        <Text style={styles.orderId}>{item.order_number}</Text>
        <Text style={styles.dateText}>{item.date_display || item.created_at?.split(',')[0]}</Text>
      </View>
      <Text style={styles.amountText}>+AED {item.amount_received || item.total_amount}</Text>
    </View>
  );

  const renderCreditNote = (note: any) => (
    <View key={note.id} style={styles.creditNoteCard}>
      <View style={styles.creditInfo}>
        <Text style={styles.customerName}>{note.customer_name}</Text>
        <Text style={styles.cnNumber}>{note.credit_note_number}</Text>
        <Text style={styles.cnSubText}>
          {note.created_at} • {note.items?.length || 0} items
        </Text>
        <Text style={styles.cnOrderRef}>Inv: {note.order_number}</Text>
      </View>
      <View style={styles.creditAmountContainer}>
        <Text style={styles.creditAmountText}>AED {note.total_credit_amount}</Text>
        <TouchableOpacity 
          style={styles.viewLink} 
          onPress={() => handleOpenPdf(note.pdf_url)}
        >
          <Text style={styles.viewLinkText}>View {'>'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C3AED']} />
          }
        >
          {/* Total Cash Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Cash in Hand</Text>
            <Text style={styles.totalAmount}>
              AED {reportData?.total_cash?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.transactionCount}>
              {reportData?.transaction_count || 0} individual cash transaction(s)
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity  
            onPress={() => navigation.navigate('CreateCashReciept')} 
            style={styles.createBtn}
          >
            <Icon xml={SVG_ICONS.plusSquare || SVG_ICONS.noteIcon} size={20} color="#3b82f6" />
            <Text style={styles.createBtnText}>Create Customer Receipt</Text>
          </TouchableOpacity>


          {/* Generated Bulk Receipts */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Generated Bulk Receipts</Text>
            {creditNotes.length > 0 ? (
              creditNotes.map(renderCreditNote)
            ) : (
              <Text style={styles.emptyText}>No bulk receipts generated.</Text>
            )}
          </View>

            {/* Time Filter Tabs */}
            <View style={styles.filterContainer}>
            {TIME_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  activeFilter === filter.key && styles.activeFilterTab
                ]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text style={[
                  styles.filterTabText,
                  activeFilter === filter.key && styles.activeFilterTabText
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Individual Transactions */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Individual Transactions</Text>
            <View style={styles.transactionsWrapper}>
              <FlatList
                data={reportData?.transactions || []}
                renderItem={renderTransaction}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, {padding: 20}]}>No transactions for this period.</Text>
                }
              />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  totalCard: {
    backgroundColor: '#8b5cf6',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  totalLabel: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  totalAmount: { color: '#FFFFFF', fontSize: 40, fontWeight: '800', marginBottom: 12 },
  transactionCount: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 15, fontWeight: '500' },
  
  createBtn: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    gap: 10,
    elevation: 2,
  },
  createBtnText: { color: '#1e293b', fontSize: 16, fontWeight: '700' },

  // Filter Styles
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeFilterTab: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeFilterTabText: {
    color: '#7C3AED',
  },
  
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeader: { fontSize: 18, fontWeight: '800', color: '#1e293b', paddingHorizontal: 16, marginBottom: 16 },
  
  creditNoteCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  creditInfo: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  cnNumber: { fontSize: 13, color: '#64748b', marginTop: 2 },
  cnSubText: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  cnOrderRef: { fontSize: 12, color: '#64748b', marginTop: 2 },
  
  creditAmountContainer: { alignItems: 'flex-end', justifyContent: 'center' },
  creditAmountText: { fontSize: 16, fontWeight: '800', color: '#2563eb' },
  viewLink: { marginTop: 8 },
  viewLinkText: { color: '#2563eb', fontWeight: '700', fontSize: 13 },

  transactionsWrapper: { paddingHorizontal: 0 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  dateText: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  amountText: { fontSize: 16, fontWeight: '700', color: '#10b981' },
  separator: { height: 1, backgroundColor: '#f1f5f9' },
  emptyText: { color: '#94a3b8', textAlign: 'center', padding: 10 },
});

export default CashInHandScreen;