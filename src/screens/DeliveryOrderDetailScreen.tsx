import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import {screenType as ScreenEnum} from './DeliveryOrderListingScreen';
import { fetchOrderDetail, updateOrderStatus } from '../api/home/homeApi';

const OrderDetails = ({route, navigation}: any) => {
  const {orderId, screenType: currentType} = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [orderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchOrderDetail(orderId);
      setOrder(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load order details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    try {
      setActionLoading(true);
      await updateOrderStatus(orderId, 'accept');
      Alert.alert('Success', 'Order Accepted Successfully', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('MainTabs', {
              screen: 'Orders',
              params: {initialTab: 'active'},
            }),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const DetailItem = ({label, value, icon}: any) => (
    <View style={styles.detailItem}>
      <Icon xml={icon} color="#94a3b8" size={20} />
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        {/* <Text style={styles.loadingText}>Fetching Details...</Text> */}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerId}>{order.order_number}</Text>

        <View style={styles.sectionCard}>
          <DetailItem
            label="Phone Number"
            value={order.phone_number}
            icon={SVG_ICONS.userIcon}
          />
          <DetailItem
            label="Address"
            value={order.address}
            icon={SVG_ICONS.locationIcon}
          />
          <DetailItem
            label="Package ID"
            value={order.id}
            icon={SVG_ICONS.boxOutline}
          />
        </View>

        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.sectionCard}>
          <DetailItem
            label="Payment Method"
            value={order.payment_method?.toUpperCase()}
            icon={SVG_ICONS.dollarIcon}
          />
          <DetailItem
            label="Amount to Collect"
            value={`AED ${order.total_amount}`}
            icon={SVG_ICONS.dollarIcon}
          />
        </View>

        <Text style={styles.sectionTitle}>Product Details</Text>
        <View style={styles.sectionCard}>
          {order.product_details?.map((product: any, index: number) => (
            <View
              key={product.id || index}
              style={[
                styles.productRow,
                index !== 0 && {
                  marginTop: 10,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: '#f1f5f9',
                },
              ]}>
              <Text style={styles.productName}>{product.product_name}</Text>
              <Text style={styles.productQty}>Qty: {product.quantity}</Text>
            </View>
          ))}
        </View>

        {currentType === ScreenEnum.NEW && (
          <TouchableOpacity
            style={[styles.finalAcceptBtn, actionLoading && {opacity: 0.7}]}
            onPress={handleAcceptOrder}
            disabled={actionLoading}>
            {actionLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.finalAcceptText}>Accept Delivery</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 10, color: '#64748b'},
  scroll: {padding: 16},
  headerId: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    color: '#1e293b',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailItem: {flexDirection: 'row', marginBottom: 16},
  detailContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginLeft: 12,
    paddingBottom: 4,
  },
  detailLabel: {fontSize: 12, color: '#94a3b8', marginBottom: 2},
  detailValue: {fontSize: 14, color: '#1e293b', fontWeight: '600'},
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {fontSize: 14, color: '#475569', flex: 1, marginRight: 10},
  productQty: {fontWeight: 'bold', color: '#1e293b'},
  finalAcceptBtn: {
    backgroundColor: '#22c55e',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#22c55e',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  finalAcceptText: {color: 'white', fontWeight: '800', fontSize: 18},
});

export default OrderDetails;
