import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '../utilities/Icon'; // Adjust path based on your project
import {SVG_ICONS} from '../assets/icons/svg'; // Adjust path based on your project

const SettingsScreen = ({navigation}: any) => {
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Preferences Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Icon xml={SVG_ICONS.sendIcon} size={22} color="#475569" />
              <Text style={styles.settingLabel}>Email Notifications</Text>
            </View>
            <Switch
              trackColor={{false: '#cbd5e1', true: '#3b82f6'}}
              thumbColor={'#ffffff'}
              onValueChange={() => setEmailNotifications(prev => !prev)}
              value={emailNotifications}
            />
          </View>
        </View>

        {/* Legal & Privacy Section */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('PrivacyPolicy')}>
            <View style={styles.rowLeft}>
              <Icon xml={SVG_ICONS.noteIcon} size={22} color="#3b82f6" />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Icon xml={SVG_ICONS.arrowRight} size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginLeft: 12,
  },
});

export default SettingsScreen;
