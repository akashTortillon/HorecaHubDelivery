import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context'; // Added for Samsung/Pixel fix
import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import Dashboard from '../screens/DeliveryDashboardScreen';
import OrderListing from '../screens/DeliveryOrderListingScreen';
import OrderHistory from '../screens/DeliveryOrderHistoryScreen';
import ProfileScreen from '../screens/DeliveryProfileScreen';
import CustomHeader from '../components/CustomHeader';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const insets = useSafeAreaInsets(); // Hook to get safe area values

  return (
    <Tab.Navigator
      screenOptions={() => ({
        header: props => <CustomHeader {...props} />,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          // FIXED: Use insets.bottom to ensure the bar sits above system buttons
          height: 60 + insets.bottom, 
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {fontWeight: '600', fontSize: 11},
      })}>
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({color}) => (
            <Icon xml={SVG_ICONS.dashboard} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Orders"
        component={OrderListing}
        options={{
          tabBarLabel: 'Deliveries',
          tabBarIcon: ({color}) => (
            <Icon xml={SVG_ICONS.suiteCase} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="DeliveryHistory"
        component={OrderHistory}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({color}) => (
            <Icon xml={SVG_ICONS.historyIcon} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => (
            <Icon xml={SVG_ICONS.userIcon} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  popup: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 34, // extra padding for safe area
    minHeight: 220,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 12,
    marginRight: -12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionLabel: {
    fontSize: 17,
    color: '#333',
    marginLeft: 16,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end', // Aligns items to the bottom
    alignItems: 'center',
    // Adjust this value to match your TabBar height.
    // Usually 60-80 depending on device safe areas.
    paddingBottom: 85,
  },
  popupContainer: {
    width: '94%', // Slightly wider to look better sitting on the bar
    backgroundColor: '#FFFFFF',
    borderRadius: 35, // Adjusting radius for a tighter pill look above the bar
    paddingVertical: 25,
    paddingHorizontal: 10,
    // Add a slight bottom border or shadow to separate from the tab bar
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2}, // Shadow goes upward
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  horizontalMenu: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100, // Fixed width helps center the icon/text precisely
  },
  menuLabel: {
    marginTop: 8,
    fontSize: 12, // Slightly smaller to match standard UI patterns
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.1,
  },
});

export default MainTabs;
