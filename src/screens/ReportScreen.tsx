import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import Dropdown, {DropdownOption} from '../components/DropDownComponent';
import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import {useToast} from '../utilities/ToastContext';
import { reportOrderReturn, fetchCreditNotes } from '../api/home/homeApi';

const REPORT_OPTIONS: DropdownOption[] = [
  {id: 'customer_not_available', name: 'Customer Not Available'},
  {id: 'reschedule_delivery', name: 'Reschedule Delivery'},
  {id: 'package_damaged', name: 'Package Damaged'},
  {id: 'wrong_address', name: 'Wrong Address'},
  {id: 'customer_refused', name: 'Customer Refused'},
  {id: 'other', name: 'Other'},
];

const ReportIssueScreen = ({route, navigation}: any) => {
  const {showToast} = useToast();
  const { orderId, orderNumber = 'Reports', viewMode = 'report', orderItems = [], customerName } = route?.params || {};

  const [reason, setReason] = useState<string | undefined>(undefined);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [creditNotes, setCreditNotes] = useState([]);
  const [fetchingNotes, setFetchingNotes] = useState(true);

  const [step, setStep] = useState<'form' | 'items'>('form');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  useEffect(() => {
    loadCreditNotes();
  }, []);

  const loadCreditNotes = async () => {
    try {
      setFetchingNotes(true);
      const creditData = await fetchCreditNotes();
      setCreditNotes(creditData?.results?.data || []);
    } catch (error) {
      console.error("Failed to fetch credit notes", error);
    } finally {
      setFetchingNotes(false);
    }
  };

  const toggleItemSelection = (item: any) => {
    const isSelected = selectedItems.find(i => i.order_item_id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i.order_item_id !== item.id));
    } else {
      setSelectedItems([...selectedItems, { order_item_id: item.id, quantity: item.quantity, ...item }]);
    }
  };

  const handleDownload = async (url: string) => {
    if (!url) {
      showToast('Download link not available', 'error');
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open download link');
    }
  };

  const handleFinalSubmit = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item to return');
      return;
    }
    try {
      setLoading(true);
      const itemsPayload = selectedItems.map(item => ({
        order_item_id: item.order_item_id,
        quantity: item.quantity
      }));
      
      await reportOrderReturn(orderId, reason!, remarks, itemsPayload);
      showToast('Return reported successfully', 'success');
      
      setStep('form');
      setReason(undefined);
      setRemarks('');
      setSelectedItems([]);
      loadCreditNotes();
    } catch (error: any) {
      Alert.alert('Submission Failed', error?.response?.data?.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCreditNote = ({item}: any) => {
    const pdfUrl = item?.pdf_url;
console.log('[df url is', item)
    return (
      <View style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteOrderId}>{item.order_number || 'ORD1002'}</Text>
          <View style={styles.failedBadge}><Text style={styles.failedText}>FAILED</Text></View>
        </View>
        <Text style={styles.customerName}>Customer: {item.customer_name || 'Customer'}</Text>
        
        <View style={styles.issueBox}>
          <View style={styles.row}>
            <Icon xml={SVG_ICONS.warningIcon} size={14} color="#E11D48" />
            <Text style={styles.issueTitle}> Issue Reason:</Text>
          </View>
          <Text style={styles.issueReason}>{item.reason || 'Issue Reported'}</Text>
        </View>
  
        <Text style={styles.productLabel}>📦 RETURNED PRODUCTS:</Text>
        {item.items?.map((prod: any, idx: number) => (
          <View key={idx} style={styles.productRow}>
            <Text style={styles.productName}>{prod?.product_name}</Text>
            <Text style={styles.productQty}>x{prod?.quantity}</Text>
          </View>
        )) || (
          <Text style={styles.noItemsText}>No items listed</Text>
        )}
  
        {pdfUrl ? (
          <TouchableOpacity 
            style={styles.downloadBtn} 
            onPress={() => handleDownload(pdfUrl)}>
            <Icon xml={SVG_ICONS.downloadIcon} size={18} color="#4F46E5" />
            <Text style={styles.downloadBtnText}> Download Credit Note</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {viewMode === 'report' && step === 'form' && (
          <View style={styles.reportSection}>
            <Text style={styles.headerLabel}>Report Issue for:</Text>
            <Text style={styles.orderIdText}>{orderNumber}</Text>

            <View style={styles.card}>
              <Text style={styles.inputLabel}>Select Reason:</Text>
              <Dropdown
                placeholder="-- Choose a reason --"
                options={REPORT_OPTIONS}
                value={reason}
                onChange={item => setReason(item.id)}
                dropDownStyles={styles.dropdownOverride}
              />
              <TextInput
                style={styles.textArea}
                placeholder="Add remarks (optional)..."
                placeholderTextColor="#94A3B8"
                multiline
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, (!reason || loading) && styles.submitButtonDisabled]}
              onPress={() => setStep('items')}
              disabled={!reason || loading}>
              <Text style={styles.submitButtonText}>Continue to Returns</Text>
            </TouchableOpacity>
          </View>
        )}

        {viewMode === 'report' && step === 'items' && (
          <View style={styles.reportSection}>
             <View style={styles.creditNoteCard}>
                <Text style={styles.creditTitle}>Request Credit Note</Text>
                <Text style={styles.orderIdText}>{orderNumber}</Text>
                <Text style={styles.customerName}>Customer: {customerName || 'Customer'}</Text>
                
                <View style={styles.issueBoxSmall}>
                  <Text style={styles.issueTitle}><Icon xml={SVG_ICONS.warningIcon} size={12} color="#E11D48" /> Issue Reason:</Text>
                  <Text style={styles.issueReasonSmall}>
                    {REPORT_OPTIONS.find(o => o.id === reason)?.name}. {remarks}
                  </Text>
                </View>

                <Text style={styles.selectLabel}>📦 SELECT PRODUCTS TO RETURN:</Text>
                {orderItems.map((item: any) => {
                  const isSelected = selectedItems.find(i => i.order_item_id === item.id);
                  return (
                    <TouchableOpacity key={item.id} style={styles.itemSelectRow} onPress={() => toggleItemSelection(item)}>
                       <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                         {isSelected && <Icon xml={SVG_ICONS.tickIcon} size={12} color="white" />}
                       </View>
                       <Text style={styles.productNameSelect}>{item.product_name}</Text>
                       <Text style={styles.productQtySelect}>x{item.quantity}</Text>
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity 
                  style={[styles.finalSubmitBtn, (selectedItems.length === 0 || loading) && styles.submitButtonDisabled]} 
                  onPress={handleFinalSubmit}>
                  {loading ? <ActivityIndicator color="white" /> : (
                    <><Icon xml={SVG_ICONS.noteIcon} size={18} color="white" /><Text style={styles.submitButtonText}> Request Credit Note</Text></>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep('form')}><Text style={styles.backBtnText}>Go Back</Text></TouchableOpacity>
             </View>
          </View>
        )}

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Reported Issues & Returns</Text>
          {fetchingNotes ? (
            <ActivityIndicator style={{marginTop: 20}} color="#E11D48" />
          ) : (
            creditNotes.map((item: any, index: number) => <View key={index}>{renderCreditNote({item})}</View>)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  scrollContent: {padding: 20},
  reportSection: {marginBottom: 30},
  headerLabel: {fontSize: 18, fontWeight: '700', color: '#1E293B'},
  orderIdText: {fontSize: 24, fontWeight: '800', color: '#E11D48', marginTop: 8, marginBottom: 5},
  card: {backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0'},
  inputLabel: {fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8},
  dropdownOverride: {marginBottom: 16},
  textArea: {height: 100, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, textAlignVertical: 'top', color:'#475569'},
  submitButton: {backgroundColor: '#E11D48', borderRadius: 12, height: 55, justifyContent: 'center', alignItems: 'center', marginTop: 15},
  submitButtonDisabled: {backgroundColor: '#FDA4AF'},
  submitButtonText: {color: '#FFF', fontWeight: '700', fontSize: 16},
  creditNoteCard: {backgroundColor: 'white', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2},
  creditTitle: {fontSize: 20, fontWeight: '800', color: '#1E293B'},
  issueBoxSmall: {backgroundColor: '#FFF1F2', padding: 12, borderRadius: 8, marginTop: 10, marginBottom: 15},
  issueReasonSmall: {color: '#991B1B', fontSize: 13, marginTop: 2},
  selectLabel: {fontSize: 12, color: '#64748B', fontWeight: '700', marginBottom: 10},
  itemSelectRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'},
  checkbox: {width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#3B82F6', marginRight: 12, justifyContent: 'center', alignItems: 'center'},
  checkboxActive: {backgroundColor: '#3B82F6'},
  productNameSelect: {flex: 1, color: '#334155', fontSize: 15, fontWeight: '500'},
  productQtySelect: {fontWeight: '800', color: '#1E293B'},
  finalSubmitBtn: {backgroundColor: '#3B82F6', borderRadius: 12, height: 55, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20},
  backBtnText: {textAlign: 'center', marginTop: 15, color: '#64748B', fontWeight: '600'},
  sectionTitle: {fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 15},
  noteCard: {backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0'},
  noteHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  noteOrderId: {fontSize: 18, fontWeight: '800', color: '#1E293B'},
  failedBadge: {backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4},
  failedText: {color: '#B91C1C', fontSize: 10, fontWeight: '800'},
  customerName: {color: '#64748B', marginTop: 4, fontSize: 14},
  issueBox: {backgroundColor: '#FFF1F2', padding: 12, borderRadius: 8, marginTop: 12},
  issueTitle: {color: '#E11D48', fontWeight: '700', fontSize: 13},
  issueReason: {color: '#991B1B', fontSize: 13, marginTop: 4},
  productLabel: {fontSize: 12, color: '#64748B', fontWeight: '700', marginTop: 15},
  productRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 8},
  productName: {color: '#334155', fontSize: 14},
  productQty: {fontWeight: '700', color: '#1E293B'},
  downloadBtn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#4F46E5', borderRadius: 8, padding: 12, marginTop: 15},
  downloadBtnText: {color: '#4F46E5', fontWeight: '700'},
  row: {flexDirection: 'row', alignItems: 'center'},
  noItemsText: {color: '#94A3B8', fontSize: 12, marginTop: 5},
});

export default ReportIssueScreen;