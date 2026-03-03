import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import {useToast} from '../utilities/ToastContext';
import {fetchOrderDetail, updateOrderStatus} from '../api/home/homeApi';

const ActiveOrderDetails = ({navigation, route}: any) => {
  const {orderId} = route.params;
  const {showToast} = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [modalType, setModalType] = useState<null | 'otp' | 'cash' | 'success'>(
    null,
  );

  const [otp, setOtp] = useState('');
  const otpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchOrderDetail(orderId);
      setOrder(data);
    } catch (error) {
      showToast('Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (action: string, extraData: any = {}) => {
    try {
      setActionLoading(true);
      const response = await updateOrderStatus(orderId, action, extraData);

      setOrder((prev: any) => ({
        ...prev,
        status: response.results.data.status,
        delivery_status: response.results.data.delivery_status,
      }));

      if (action === 'verify_otp') {
        setModalType('success');
      } else {
        showToast(
          `Order status updated to ${action.replace(/_/g, ' ')}`,
          'success',
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error?.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const renderModal = () => (
    <Modal transparent visible={!!modalType} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              setModalType(null);
              setOtp('');
            }}>
            <Icon xml={SVG_ICONS.closeIcon} size={24} color="#94a3b8" />
          </TouchableOpacity>

          {modalType === 'otp' && (
            <View style={{alignItems: 'center', width: '100%'}}>
              <Icon xml={SVG_ICONS.shieldIcon} size={60} color="#3b82f6" />
              <Text style={styles.modalTitle}>Verify Delivery</Text>
              <Text style={styles.modalSub}>
                Enter the 4-digit OTP provided by the customer.
              </Text>

              {/* FIXED: TextInput positioned to capture all touches in the OTP area */}
              <View style={styles.otpInputWrapper}>
                <TextInput
                  ref={otpInputRef}
                  value={otp}
                  onChangeText={val => val.length <= 4 && setOtp(val)}
                  keyboardType="number-pad"
                  style={styles.hiddenTextInput}
                  autoFocus={true}
                  maxLength={4}
                />
                <TouchableOpacity
                  style={styles.otpContainer}
                  activeOpacity={1}
                  onPress={() => otpInputRef.current?.focus()}>
                  {[0, 1, 2, 3].map(index => (
                    <View
                      key={index}
                      pointerEvents="none"
                      style={[
                        styles.otpBox,
                        otp.length === index && styles.otpBoxActive,
                      ]}>
                      <Text style={styles.otpText}>{otp[index] || ''}</Text>
                    </View>
                  ))}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.modalActionBtn,
                  (otp.length < 4 || actionLoading) && {
                    backgroundColor: '#cbd5e1',
                  },
                ]}
                disabled={otp.length < 4 || actionLoading}
                onPress={() => handleStatusUpdate('verify_otp', {otp})}>
                {actionLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalActionText}>Verify & Complete</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {modalType === 'success' && (
            <View style={{alignItems: 'center', width: '100%'}}>
              <View style={styles.successCircle}>
                <Icon xml={SVG_ICONS.tickIcon} size={40} color="#10b981" />
              </View>
              <Text style={styles.modalTitle}>Order Completed!</Text>
              <TouchableOpacity
                style={styles.modalActionBtn}
                onPress={() => {
                  setModalType(null);
                  navigation.navigate('ReceiptScreen', {orderId: order.id});
                }}>
                <Text style={styles.modalActionText}>View Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => navigation.navigate('MainTabs')}>
                <Text style={styles.outlineBtnText}>Return to Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading || !order) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const dStatus = order.delivery_status;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.contentCard}>
          <Text style={styles.orderIdTitle}>{order.order_number}</Text>
          <InfoRow
            label="Address"
            value={order.address}
            icon={SVG_ICONS.locationIcon}
          />
          <InfoRow
            label="Contact"
            value={order.phone_number || 'No contact provided'}
            icon={SVG_ICONS.userIcon}
          />

          <View style={styles.paymentSection}>
            <Icon xml={SVG_ICONS.dollarIcon} size={20} color="#3b82f6" />
            <View style={{marginLeft: 10}}>
              <Text style={styles.paymentLabel}>
                Payment ({order.payment_method?.toUpperCase()})
              </Text>
              <Text style={styles.paymentValue}>AED {order.total_amount}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowItems(!showItems)}>
            <View style={styles.row}>
              <Icon xml={SVG_ICONS.noteIcon} size={20} color="#3b82f6" />
              <Text style={styles.dropdownText}>Product Details</Text>
            </View>
            <Icon
              xml={showItems ? SVG_ICONS.chevronUp : SVG_ICONS.arrowDown}
              size={20}
              color="#334155"
            />
          </TouchableOpacity>

          {showItems &&
            order.product_details?.map((item: any) => (
              <View key={item.id} style={styles.itemDetail}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
            ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {dStatus === 'accepted' && (
          <TouchableOpacity
            style={[styles.mainBtn, {backgroundColor: '#8b5cf6'}]}
            onPress={() => handleStatusUpdate('pickup')}
            disabled={actionLoading}>
            {actionLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.mainBtnText}>Confirm Pickup</Text>
            )}
          </TouchableOpacity>
        )}

        {dStatus === 'in_transit' && (
          <TouchableOpacity
            style={[styles.mainBtn, {backgroundColor: '#f97316'}]}
            onPress={() => handleStatusUpdate('out_for_delivery')}
            disabled={actionLoading}>
            {actionLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.mainBtnText}>Mark Out for Delivery</Text>
            )}
          </TouchableOpacity>
        )}

        {dStatus === 'out_for_delivery' && (
          <TouchableOpacity
            style={styles.mainBtn}
            onPress={() => setModalType('otp')}>
            <Text style={styles.mainBtnText}>Deliver & Verify OTP</Text>
          </TouchableOpacity>
        )}

        <View style={styles.rowBetween}>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Call Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ReportScreeen', {orderId: order.id})
            }
            style={[styles.secondaryBtn, {backgroundColor: '#fee2e2'}]}>
            <Text style={[styles.secondaryBtnText, {color: '#ef4444'}]}>
              Report Issue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {renderModal()}
    </View>
  );
};

const InfoRow = ({label, value, icon}: any) => (
  <View style={styles.infoRow}>
    <Icon xml={icon} size={18} color="#3b82f6" />
    <View style={{marginLeft: 12}}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  contentCard: {
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 10,
  },
  orderIdTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
  },
  infoRow: {flexDirection: 'row', marginBottom: 20},
  infoLabel: {fontSize: 13, color: '#64748b'},
  infoValue: {fontSize: 15, fontWeight: '700', color: '#1e293b'},
  paymentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
  },
  paymentLabel: {fontSize: 13, color: '#64748b'},
  paymentValue: {fontSize: 16, fontWeight: '800', color: '#1e293b'},
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
  },
  dropdownText: {fontWeight: '700', color: '#334155', marginLeft: 10},
  itemDetail: {
    padding: 15,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {color: '#475569', fontWeight: '600', flex: 1},
  itemQty: {fontWeight: '800', marginLeft: 10},
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  mainBtn: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    marginBottom: 10,
  },
  mainBtnText: {color: 'white', fontWeight: '800', fontSize: 16},
  rowBetween: {flexDirection: 'row', justifyContent: 'space-between'},
  secondaryBtn: {
    flex: 0.48,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {color: '#2563eb', fontWeight: '700'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    width: '100%',
  },
  closeBtn: {alignSelf: 'flex-end'},
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginVertical: 10,
  },
  modalSub: {textAlign: 'center', color: '#64748b', marginBottom: 20},

  // FIXED OTP STYLES
  otpInputWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    height: 60,
  },
  hiddenTextInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 99,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
  },
  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  otpBoxActive: {borderColor: '#3b82f6', borderWidth: 2},
  otpText: {fontSize: 22, fontWeight: 'bold', color: '#1e293b'},

  modalActionBtn: {
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 15,
  },
  modalActionText: {color: 'white', fontWeight: '800', fontSize: 16},
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  outlineBtn: {marginTop: 15},
  outlineBtnText: {color: '#64748b', fontWeight: '700'},
  row: {flexDirection: 'row', alignItems: 'center'},
});

export default ActiveOrderDetails;
