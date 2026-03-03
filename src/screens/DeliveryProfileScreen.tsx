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
import {useAuthStore} from '../store/useAuthStore';
import {getProfile, updateStatus} from '../api/home/homeApi';

const ProfileScreen = ({navigation}: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'free' | 'busy') => {
    if (profile?.availability_status === newStatus) return;

    try {
      setUpdating(true);
      // We send 'active' or 'busy' to match the backend expectation
      const response = await updateStatus(newStatus);

      // Update local state with the results from the API response
      // This ensures the 'isFree' check updates immediately
      setProfile(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Consistent check for 'active' status
  const isFree = profile.availability_status === 'free';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {/* Header Section */}
        <View style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile.full_name?.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.agentId}>ID: {profile.id}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{profile.username}</Text>
            </View>
          </View>
        </View>

        {/* Vehicle & Availability */}
        <View style={styles.sectionCard}>
          <View style={styles.infoRow}>
            <Icon xml={SVG_ICONS.truckIcon} size={20} color="#94a3b8" />
            <View style={{marginLeft: 10}}>
              <Text style={styles.infoLabel}>Vehicle Details</Text>
              <Text style={styles.infoValue}>
                {profile.vehicle_type?.toUpperCase()} -{' '}
                {profile.vehicle_registration?.toUpperCase()}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.infoRow,
              {
                marginTop: 15,
                borderTopWidth: 1,
                borderTopColor: '#f1f5f9',
                paddingTop: 15,
              },
            ]}>
            <Icon xml={SVG_ICONS.timer} size={20} color="#94a3b8" />
            <View style={styles.flexRowBetween}>
              <View>
                <Text style={styles.infoLabel}>Duty Status</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {color: isFree ? '#22c55e' : '#ef4444'},
                  ]}>
                  {isFree ? 'Free (Active)' : 'Busy'}
                </Text>
              </View>

              {/* Status Toggle Buttons */}
              <View style={styles.toggleContainer}>
                {updating ? (
                  <ActivityIndicator
                    size="small"
                    color="#2563eb"
                    style={{paddingHorizontal: 20}}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => handleStatusChange('free')}
                      style={[
                        styles.toggleBtn,
                        isFree && styles.toggleActiveFree,
                      ]}>
                      <Text
                        style={[
                          styles.toggleText,
                          isFree && styles.toggleTextActive,
                        ]}>
                        Free
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleStatusChange('busy')}
                      style={[
                        styles.toggleBtn,
                        !isFree && styles.toggleActiveBusy,
                      ]}>
                      <Text
                        style={[
                          styles.toggleText,
                          !isFree && styles.toggleTextActive,
                        ]}>
                        Busy
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* KPIs Section */}
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <View style={styles.kpiGrid}>
          <KPICard
            title="TOTAL DELIVERED"
            value={profile.total_orders_delivered}
            color="#f0fdf4"
            textColor="#166534"
          />
          <KPICard
            title="RATING"
            value={`${profile.customer_rating} ⭐`}
            color="#fffbeb"
            textColor="#92400e"
          />
        </View>

        {/* Menu Options */}
        <View style={styles.menuCard}>
          <MenuItem
            icon={SVG_ICONS.dollarIcon}
            title="Cash Report"
            onPress={() => navigation.navigate('CashReportScreen')}
          />
          <MenuItem
            icon={SVG_ICONS.settingsIcon}
            title="Settings"
            onPress={() => navigation.navigate('SettingScreen')}
          />
          <MenuItem
            icon={SVG_ICONS.supportIcon}
            title="Help & Support"
            isLast
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => {
            Alert.alert('Logout', 'Are you sure you want to exit?', [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Logout', onPress: logout, style: 'destructive'},
            ]);
          }}>
          <Icon xml={SVG_ICONS.signOut} size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Sub-components ---

const KPICard = ({title, value, color, textColor}: any) => (
  <View style={[styles.kpiCard, {backgroundColor: color}]}>
    <Text style={styles.kpiLabel}>{title}</Text>
    <Text style={[styles.kpiValue, {color: textColor}]}>{value}</Text>
  </View>
);

const MenuItem = ({icon, title, isLast, onPress}: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.menuItem, isLast && {borderBottomWidth: 0}]}>
    <View style={styles.row}>
      <Icon xml={icon} size={20} color="#334155" />
      <Text style={styles.menuText}>{title}</Text>
    </View>
    <Icon xml={SVG_ICONS.arrowRight} size={20} color="#334155" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  scrollPadding: {padding: 16},
  headerCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  avatarText: {fontSize: 24, fontWeight: 'bold', color: '#1e40af'},
  headerInfo: {marginLeft: 16, flex: 1},
  name: {fontSize: 20, fontWeight: '800', color: '#1e293b'},
  agentId: {fontSize: 14, color: '#64748b', marginVertical: 2},
  roleBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleText: {color: '#64748b', fontSize: 11, fontWeight: '700'},
  sectionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoRow: {flexDirection: 'row', alignItems: 'center'},
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'center',
    marginLeft: 10,
  },
  infoLabel: {fontSize: 12, color: '#94a3b8'},
  infoValue: {fontSize: 14, fontWeight: '700', color: '#1e293b'},
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6},
  toggleActiveFree: {backgroundColor: '#22c55e'},
  toggleActiveBusy: {backgroundColor: '#ef4444'},
  toggleText: {fontSize: 12, color: '#64748b', fontWeight: '600'},
  toggleTextActive: {color: 'white'},
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  kpiValue: {fontSize: 20, fontWeight: '800'},
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 10},
  menuText: {fontSize: 15, color: '#334155', fontWeight: '500'},
  signOutBtn: {
    backgroundColor: '#fee2e2',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    flexDirection: 'row',
    gap: 10,
  },
  signOutText: {color: '#ef4444', fontWeight: 'bold', fontSize: 16},
});

export default ProfileScreen;
