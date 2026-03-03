import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';

const ReceiptScreen = ({navigation, route}: any) => {
  const {order} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon xml={SVG_ICONS.backIcon} size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Receipt</Text>
        <Icon xml={SVG_ICONS.bellIcon} size={24} color="#334155" />
      </View>

      <View style={styles.receiptCard}>
        <View style={styles.successBadge}>
          <Icon xml={SVG_ICONS.tickIcon} size={30} color="#10b981" />
        </View>
        <Text style={styles.receiptType}>CASH RECEIPT</Text>
        <Text style={styles.date}>01/03/2026 • 08:25:16</Text>

        <View style={styles.divider} />

        <Text style={styles.totalLabel}>TOTAL AMOUNT RECEIVED</Text>
        <Text style={styles.totalValue}>AED {order?.orderValue}</Text>
        <View style={styles.cashTag}>
          <Text style={styles.cashTagText}>PAID VIA CASH</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Order Ref</Text>
          <Text style={styles.value}>{order?.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Customer</Text>
          <View style={{alignItems: 'flex-end'}}>
            <Text style={styles.value}>{order?.customerName}</Text>
            <Text style={styles.subValue}>456 Oak Ave, Somecity, USA...</Text>
          </View>
        </View>

        <View style={styles.itemBox}>
          <Text style={styles.itemHeader}>ITEM DETAILS</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Smart Watch Series 8</Text>
            <Text style={styles.itemQty}>x1</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Silicone Strap (Black)</Text>
            <Text style={styles.itemQty}>x1</Text>
          </View>
        </View>

        <Text style={styles.txnIdLabel}>TRANSACTION ID</Text>
        <View style={styles.txnBox}>
          <Text style={styles.txnId}>TXN-{order?.id}-7927</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('OrderListing')}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  headerTitle: {fontSize: 18, fontWeight: '800', color: '#1e293b'},
  receiptCard: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    elevation: 2,
  },
  successBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  receiptType: {fontSize: 20, fontWeight: '900', color: '#1e293b'},
  date: {color: '#64748b', fontSize: 13, marginTop: 5},
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 1,
  },
  totalLabel: {fontSize: 12, fontWeight: '700', color: '#94a3b8'},
  totalValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    marginVertical: 10,
  },
  cashTag: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cashTagText: {color: '#059669', fontSize: 11, fontWeight: '800'},
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  label: {color: '#94a3b8', fontWeight: '600'},
  value: {fontWeight: '800', color: '#1e293b'},
  subValue: {fontSize: 11, color: '#94a3b8'},
  itemBox: {
    width: '100%',
    marginTop: 25,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
  },
  itemHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {color: '#475569', fontWeight: '600'},
  itemQty: {fontWeight: '800', color: '#1e293b'},
  txnIdLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    marginTop: 25,
  },
  txnBox: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 5,
  },
  txnId: {fontSize: 12, color: '#64748b', fontWeight: '600'},
  footer: {flexDirection: 'row', padding: 20, gap: 15},
  shareBtn: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareText: {fontWeight: '700', color: '#334155'},
  doneBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneText: {color: 'white', fontWeight: '700'},
});

export default ReceiptScreen;
