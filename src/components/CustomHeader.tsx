import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {getHeaderTitle} from '@react-navigation/elements';
import Icon from '../utilities/Icon';
import { SVG_ICONS } from '../assets/icons/svg';
// Assuming your Icon component setup
// import { Icon } from './path-to-your-icon-component';
// import { SVG_ICONS } from './constants/icons';

const CustomHeader = ({navigation, route, options}: any) => {
  // Dynamically gets the title from the screen options or route name
  const title = getHeaderTitle(options, route.name);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {/* Left Side: Route Title */}
        <Text style={styles.headerTitle}>{title}</Text>

        {/* Right Side: Notification Icon with Badge */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('Notifications')}>
          {/* Using your specific Icon component format */}
          <Icon xml={SVG_ICONS.bellIcon} size={24} color="#1e293b" />
          {/* Red Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>4</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', // Light grey line at bottom
  },
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800', // Matches the heavy font in screenshot
    color: '#1e293b', // Deep navy/charcoal color
  },
  iconContainer: {
    padding: 5,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444', // Red color from your UI
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CustomHeader;
