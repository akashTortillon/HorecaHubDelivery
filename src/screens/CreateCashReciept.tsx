import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Linking,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SVG_ICONS} from '../assets/icons/svg';
import {
  fetchReceiptCustomers,
  fetchPendingInvoices,
  createBulkReceipt,
} from '../api/home/homeApi';
import Dropdown, {DropdownOption} from '../components/DropDownComponent';
import Icon from '../utilities/Icon';

const CreateCashReceiptScreen = ({navigation}: any) => {
  // Data States
  const [customers, setCustomers] = useState<DropdownOption[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(undefined);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [collectedAmount, setCollectedAmount] = useState('0.00');

  // UI States
  const [loading, setLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetchReceiptCustomers();
      const mappedCustomers = res.results.data.map((c: any) => ({
        name: c.name,
        id: c.id,
      }));
      setCustomers(mappedCustomers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = async (item: DropdownOption) => {
    setSelectedCustomer(item.id);
    setSelectedInvoices([]);
    setCollectedAmount('0.00');
    try {
      setInvoicesLoading(true);
      const res = await fetchPendingInvoices(item.id);
      setInvoices(res.results.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load pending invoices');
    } finally {
      setInvoicesLoading(false);
    }
  };

  const toggleInvoice = (invoice: any) => {
    let newSelected = [...selectedInvoices];
    if (newSelected.includes(invoice.order_id)) {
      newSelected = newSelected.filter(id => id !== invoice.order_id);
    } else {
      newSelected.push(invoice.order_id);
    }
    setSelectedInvoices(newSelected);

    const total = invoices
      .filter(inv => newSelected.includes(inv.order_id))
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
    setCollectedAmount(total.toFixed(2));
  };

  const handleGenerateReceipt = async () => {
    if (selectedInvoices.length === 0 || !selectedCustomer) return;
    try {
      setLoading(true);
      const payload = {
        customer_id: selectedCustomer,
        order_ids: selectedInvoices,
        amount_collected: parseFloat(collectedAmount),
      };
      const res = await createBulkReceipt(payload);
      setReceiptData(res.results.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS VIEW
  if (receiptData) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.receiptContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.receiptCard}>
            <View style={styles.receiptIconCircle}>
              <Icon xml={SVG_ICONS.editIcon} size={30} color="#3b82f6" />
            </View>
            <Text style={styles.bulkTitle}>BULK CASH RECEIPT</Text>
            <Text style={styles.refText}>Ref: {receiptData.receipt_ref}</Text>
            <Text style={styles.dateText}>{receiptData.created_at}</Text>

            <View style={styles.dashedLine} />

            <Text style={styles.totalLabel}>TOTAL AMOUNT COLLECTED</Text>
            <Text style={styles.totalVal} numberOfLines={1} adjustsFontSizeToFit>
              AED {receiptData.total_amount_collected}
            </Text>
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>PAID VIA CASH</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer</Text>
              <Text style={styles.detailValue}>{receiptData.customer_name}</Text>
            </View>

            <Text style={styles.includedHeader}>INCLUDED INVOICES</Text>
            {receiptData.invoices.map((inv: any, idx: number) => (
              <View key={idx} style={styles.finalInvoiceItem}>
                <View style={{flex: 1}}>
                  <Text style={styles.invNo}>Invoice #{inv.order_number}</Text>
                  <Text style={styles.invDate}>{inv.created_at?.split('T')[0]}</Text>
                </View>
                <Text style={styles.invAmt}>AED {inv.total_amount}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.receiptFooter}>
          <TouchableOpacity 
            style={styles.downloadBtn} 
            onPress={() => Linking.openURL(receiptData.receipt_url)}
          >
            <Icon xml={SVG_ICONS.downloadIcon || SVG_ICONS.noteIcon} size={20} color="#1e293b" />
            <Text style={styles.downloadBtnText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // MAIN FORM VIEW
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
      >
        <ScrollView contentContainerStyle={{padding: 16}} showsVerticalScrollIndicator={false}>
          <Text style={styles.headerTitle}>Create Cash Receipt</Text>

          {/* Customer Selection */}
          <View style={styles.card}>
            <Text style={styles.label}>Select Customer</Text>
            <Dropdown
              placeholder="-- Choose Customer --"
              options={customers}
              value={selectedCustomer}
              onChange={handleCustomerChange}
              dropDownStyles={styles.customDropdownStyle}
            />
          </View>

          {/* Pending Invoices */}
          {selectedCustomer && (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.label} numberOfLines={1}>Pending Invoices ({invoices.length})</Text>
                {invoices.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => {
                      const allIds = invoices.map(i => i.order_id);
                      const isAllSelected = selectedInvoices.length === invoices.length;
                      const newSelection = isAllSelected ? [] : allIds;
                      setSelectedInvoices(newSelection);
                      const total = isAllSelected ? 0 : invoices.reduce((sum, i) => sum + parseFloat(i.total_amount), 0);
                      setCollectedAmount(total.toFixed(2));
                    }}
                  >
                    <Text style={styles.selectAllText}>
                      {selectedInvoices.length === invoices.length ? 'Deselect All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.invoicesListContainer}>
                {invoicesLoading ? (
                  <ActivityIndicator color="#3b82f6" style={{margin: 20}} />
                ) : invoices.length > 0 ? (
                  invoices.map(item => (
                    <TouchableOpacity
                      key={item.order_id}
                      style={[
                        styles.invoiceItem,
                        selectedInvoices.includes(item.order_id) && styles.invoiceItemSelected,
                      ]}
                      onPress={() => toggleInvoice(item)}
                    >
                      <View style={[styles.row, {flex: 1, marginRight: 8}]}>
                        <View style={[
                          styles.checkbox,
                          selectedInvoices.includes(item.order_id) && styles.checkboxActive
                        ]}>
                          {selectedInvoices.includes(item.order_id) && (
                            <Icon xml={SVG_ICONS.tickIcon} size={12} color="white" />
                          )}
                        </View>
                        <View style={{flex: 1}}>
                          <Text style={styles.invTitle} numberOfLines={1}>{item.order_number}</Text>
                          <Text style={styles.invSub} numberOfLines={1}>{item.created_at}</Text>
                        </View>
                      </View>
                      <Text style={styles.invPrice}>AED {item.total_amount}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No pending invoices for this customer.</Text>
                )}
              </View>
            </View>
          )}

          {/* Amount Input Section */}
          <View style={styles.card}>
            <View style={styles.rowBetweenWrap}>
              <Text style={styles.totalCollectLabel}>Total to Collect:</Text>
              <View style={styles.amountInputRow}>
                <Text style={styles.currencyLabel}>AED</Text>
                <TextInput
                  style={styles.amountInput}
                  value={collectedAmount}
                  onChangeText={setCollectedAmount}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.generateBtn,
                (selectedInvoices.length === 0 || loading) && {backgroundColor: '#a7f3d0'},
              ]}
              disabled={selectedInvoices.length === 0 || loading}
              onPress={handleGenerateReceipt}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.generateBtnText}>Generate Receipt</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  headerTitle: {fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 20},
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    width: '100%',
  },
  label: {fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 12, flexShrink: 1},
  customDropdownStyle: {
    backgroundColor: 'white',
    borderColor: '#3b82f6',
    borderWidth: 1.5,
    height: 55,
  },
  selectAllText: {color: '#3b82f6', fontWeight: '700', fontSize: 13, marginBottom: 12, marginLeft: 8},
  invoicesListContainer: {
    width: '100%',
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    width: '100%',
  },
  invoiceItemSelected: {borderColor: '#3b82f6', backgroundColor: '#eff6ff'},
  checkbox: {width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#cbd5e1', marginRight: 10, justifyContent: 'center', alignItems: 'center'},
  checkboxActive: {backgroundColor: '#3b82f6', borderColor: '#3b82f6'},
  invTitle: {fontSize: 14, fontWeight: '700', color: '#1e293b'},
  invSub: {fontSize: 11, color: '#94a3b8', marginTop: 2},
  invPrice: {fontSize: 14, fontWeight: '700', color: '#1e293b'},
  row: {flexDirection: 'row', alignItems: 'center'},
  rowBetween: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%'},
  rowBetweenWrap: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap',
    gap: 8
  },
  totalCollectLabel: {fontSize: 16, fontWeight: '800', color: '#475569'},
  amountInputRow: {flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#10b981', paddingBottom: 2},
  currencyLabel: {fontSize: 14, fontWeight: '700', color: '#94a3b8', marginRight: 8},
  amountInput: {fontSize: 20, fontWeight: '800', color: '#1e293b', minWidth: 60, textAlign: 'right', paddingVertical: 0},
  generateBtn: {height: 55, backgroundColor: '#10b981', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20},
  generateBtnText: {color: 'white', fontSize: 18, fontWeight: '800'},
  emptyText: {textAlign: 'center', color: '#94a3b8', padding: 10, fontSize: 13},

  // Success Receipt Styles
  receiptContainer: {padding: 16, paddingTop: 20, paddingBottom: 40},
  receiptCard: {backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 4},
  receiptIconCircle: {width: 60, height: 60, borderRadius: 30, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 15},
  bulkTitle: {fontSize: 18, fontWeight: '800', color: '#1e293b', letterSpacing: 0.5},
  refText: {fontSize: 13, color: '#64748b', marginTop: 4},
  dateText: {fontSize: 11, color: '#94a3b8', marginTop: 2},
  dashedLine: {width: '100%', height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#e2e8f0', marginVertical: 20},
  totalLabel: {fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 1},
  totalVal: {fontSize: 32, fontWeight: '800', color: '#1e293b', marginVertical: 8, textAlign: 'center'},
  paidBadge: {backgroundColor: '#d1fae5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20},
  paidText: {color: '#065f46', fontSize: 11, fontWeight: '800'},
  detailRow: {flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 25},
  detailLabel: {color: '#64748b', fontSize: 14},
  detailValue: {fontWeight: '700', color: '#1e293b', fontSize: 14, textAlign: 'right', flex: 1, marginLeft: 10},
  includedHeader: {alignSelf: 'flex-start', fontSize: 12, fontWeight: '800', color: '#94a3b8', marginTop: 25, marginBottom: 12},
  finalInvoiceItem: {flexDirection: 'row', justifyContent: 'space-between', width: '100%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 8, alignItems: 'center'},
  invNo: {fontSize: 13, fontWeight: '700', color: '#1e293b'},
  invDate: {fontSize: 11, color: '#94a3b8', marginTop: 2},
  invAmt: {fontSize: 13, fontWeight: '700', color: '#1e293b', marginLeft: 8},
  receiptFooter: {flexDirection: 'row', padding: 16, gap: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9'},
  downloadBtn: {flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8},
  downloadBtnText: {fontWeight: '700', color: '#1e293b', fontSize: 14},
  doneBtn: {flex: 1, height: 50, backgroundColor: '#3b82f6', borderRadius: 12, justifyContent: 'center', alignItems: 'center'},
  doneBtnText: {color: 'white', fontWeight: '800', fontSize: 15},
});

export default CreateCashReceiptScreen;