import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {SVG_ICONS} from '../assets/icons/svg';
import {fetchOrderDetail, updateOrderStatus} from '../api/home/homeApi';
import {useToast} from '../utilities/ToastContext';
import Icon from '../utilities/Icon';

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
  const [cashAmount, setCashAmount] = useState('');
  const otpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchOrderDetail(orderId);
      setOrder(data);
      if (data?.total_amount) {
        setCashAmount(data.total_amount.toString());
      }
    } catch (error) {
      showToast('Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openNavigation = () => {
    const lat = order?.latitude || 25.2048; // Default to Dubai if null
    const lng = order?.longitude || 55.2708;
    const label = order?.address || 'Delivery Location';

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });

    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Google Maps is not installed');
        }
      });
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

      if (action === 'verify_otp' || action === 'client_acknowledgement') {
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

          {modalType === 'cash' && (
            <View style={{alignItems: 'center', width: '100%'}}>
              <Icon xml={SVG_ICONS.dollarIcon} size={60} color="#10b981" />
              <Text style={styles.cashModalTitle}>Log Cash Payment</Text>
              <Text style={styles.cashModalSub}>
                Order:{' '}
                <Text style={{fontWeight: 'bold'}}>{order.order_number}</Text>
              </Text>
              <Text style={styles.cashModalSub}>
                Amount to Collect:{' '}
                <Text style={styles.collectAmount}>
                  AED {order.total_amount}
                </Text>
              </Text>
              <View style={styles.cashInputSection}>
                <Text style={styles.cashInputLabel}>Amount Received</Text>
                <View style={styles.cashInputWrapper}>
                  <Text style={styles.currencyPrefix}>AED</Text>
                  <TextInput
                    value={cashAmount}
                    onChangeText={setCashAmount}
                    keyboardType="decimal-pad"
                    style={styles.cashTextInput}
                    placeholder="0.00"
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.cashConfirmBtn,
                  (!cashAmount || actionLoading) && {
                    backgroundColor: '#a7f3d0',
                  },
                ]}
                disabled={!cashAmount || actionLoading}
                onPress={() =>
                  handleStatusUpdate('client_acknowledgement', {
                    cash_collected: parseFloat(cashAmount),
                  })
                }>
                {actionLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.cashConfirmText}>
                    Confirm Cash Received
                  </Text>
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
      {/* Map Header Section */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: order.latitude || 25.2048,
            longitude: order.longitude || 55.2708,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}>
          <Marker
            coordinate={{
              latitude: order.latitude || 25.2048,
              longitude: order.longitude || 55.2708,
            }}
          />
        </MapView>

        {/* GPS Badge */}
        <View style={styles.gpsBadge}>
          <View style={styles.gpsDot} />
          <Text style={styles.gpsText}>Live GPS</Text>
        </View>

        {/* Start Navigation Button */}
        <TouchableOpacity
          style={styles.navFloatingBtn}
          onPress={openNavigation}>
          <Icon xml={SVG_ICONS.locationIcon} size={18} color="white" />
          <Text style={styles.navBtnText}>Start Navigation</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{marginTop: -20}}>
        <View style={styles.contentCard}>
          <Text style={styles.orderIdTitle}>{order.order_number}</Text>
          <InfoRow
            label="Customer"
            value={order.customer_name || 'Charlie Brown'}
            icon={SVG_ICONS.userIcon}
          />
          <InfoRow
            label="Deliver To"
            value={order.address}
            icon={SVG_ICONS.locationIcon}
          />

          <View style={styles.instructionBox}>
            <View style={styles.row}>
              <Icon xml={SVG_ICONS.noteIcon} size={16} color="#ef4444" />
              <Text style={styles.instructionHeader}>
                {' '}
                DELIVERY INSTRUCTIONS
              </Text>
            </View>
            <Text style={styles.instructionText}>
              {order.instructions || 'Fragile, handle with care.'}
            </Text>
          </View>

          <View style={styles.paymentSection}>
            <Icon xml={SVG_ICONS.dollarIcon} size={20} color="#3b82f6" />
            <View style={{marginLeft: 10}}>
              <Text style={styles.paymentLabel}>Payment</Text>
              <Text style={styles.paymentValue}>
                {order.payment_method?.toUpperCase() || 'COD'}: AED{' '}
                {order.total_amount}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowItems(!showItems)}>
            <View style={styles.row}>
              <Icon xml={SVG_ICONS.noteIcon} size={20} color="#3b82f6" />
              <Text style={styles.dropdownText}>Show Product Details</Text>
            </View>
            <Icon
              xml={showItems ? SVG_ICONS.chevronUp : SVG_ICONS.arrowRight}
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
          <>
            <TouchableOpacity
              style={[styles.mainBtn, {flexDirection: 'row', gap: 8}]}
              onPress={() => setModalType('otp')}>
              <Icon xml={SVG_ICONS.shieldIcon} size={18} color="white" />
              <Text style={styles.mainBtnText}>Verify Customer OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.outlineActionBtn, {flexDirection: 'row', gap: 8}]}
              onPress={() => setModalType('cash')}>
              <Icon xml={SVG_ICONS.noteIcon} size={18} color="#2563eb" />
              <Text style={styles.outlineActionBtnText}>
                Client Acknowledgement
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.rowBetween}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => Linking.openURL(`tel:${order.phone_number}`)}>
            <View style={styles.row}>
              <Icon xml={SVG_ICONS.callIcon} size={16} color="#2563eb" />
              <Text style={styles.secondaryBtnText}> Call Customer</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ReportScreeen', {orderId: order.id})
            }
            style={[styles.secondaryBtn, {backgroundColor: '#fee2e2'}]}>
            <View style={styles.row}>
              <Icon xml={SVG_ICONS.warningIcon} size={16} color="#ef4444" />
              <Text style={[styles.secondaryBtnText, {color: '#ef4444'}]}>
                {' '}
                Report Issue
              </Text>
            </View>
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
  mapContainer: {height: 250, width: '100%', position: 'relative'},
  map: {flex: 1},
  gpsBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    elevation: 5,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  gpsText: {fontSize: 12, fontWeight: '700', color: '#1e293b'},
  navFloatingBtn: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 8,
  },
  navBtnText: {color: 'white', fontWeight: '800', marginLeft: 8},
  contentCard: {
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 500,
  },
  orderIdTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
  },
  infoRow: {flexDirection: 'row', marginBottom: 20},
  infoLabel: {fontSize: 14, color: '#64748b', fontWeight: '500'},
  infoValue: {fontSize: 16, fontWeight: '700', color: '#1e293b', marginTop: 2},
  instructionBox: {
    backgroundColor: '#fff1f2',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionHeader: {fontSize: 12, fontWeight: '800', color: '#e11d48'},
  instructionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 5,
  },
  paymentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 10,
  },
  paymentLabel: {fontSize: 14, color: '#64748b'},
  paymentValue: {fontSize: 16, fontWeight: '800', color: '#1e293b'},
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    marginBottom: 10,
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
  outlineActionBtn: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#3b82f6',
    marginBottom: 15,
  },
  outlineActionBtnText: {color: '#2563eb', fontWeight: '800', fontSize: 16},
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
  cashModalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 10,
  },
  cashModalSub: {fontSize: 16, color: '#64748b', marginTop: 5},
  collectAmount: {color: '#10b981', fontWeight: '800'},
  cashInputSection: {width: '100%', marginTop: 20},
  cashInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  cashInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 60,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
    marginRight: 10,
  },
  cashTextInput: {flex: 1, fontSize: 24, fontWeight: 'bold', color: '#1e293b'},
  cashConfirmBtn: {
    width: '100%',
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  cashConfirmText: {color: 'white', fontWeight: '800', fontSize: 16},
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
