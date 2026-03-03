import React, {useState, useEffect} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthStore} from '../store/useAuthStore';

// Screens
import MainTabs from './MainTab';
import OrderDetails from '../screens/DeliveryOrderDetailScreen';
import {screenType} from '../screens/DeliveryOrderListingScreen';
import ActiveOrderDetails from '../screens/ActiveOrderDetailsScreen';
import ReportIssueScreen from '../screens/ReportScreen';
import ReceiptScreen from '../screens/RecieptScreen';
import LoginScreen from '../screens/LoginScreen';
import CashInHandScreen from '../screens/CashReportScreen';
import SettingsScreen from '../screens/SettingScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  OrderDetails: {orderId: string; screenType: screenType};
  ActiveOrderDetails: {orderId: string}; // Changed to string to match detail API usage
  ReportScreeen: {orderId: string};
  ReceiptScreen: {orderId: string};
  CashReportScreen: undefined;
  SettingScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  const token = useAuthStore(state => state.token);
  const bootstrap = useAuthStore(state => state.bootstrap);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Initialize data from AsyncStorage via Zustand
      await bootstrap();
      // 2. Small delay to prevent flicker
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
    };
    initAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {token === null ? (
        // --- UNAUTHENTICATED STACK ---
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        // --- AUTHENTICATED STACK (Dashboard/MainTabs) ---
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="OrderDetails"
            component={OrderDetails}
            options={{headerShown: true, title: 'Order Details'}}
          />
          <Stack.Screen
            name="ActiveOrderDetails"
            component={ActiveOrderDetails}
            options={{headerShown: true, title: 'Order Details'}}
          />
          <Stack.Screen
            name="ReportScreeen"
            component={ReportIssueScreen}
            options={{headerShown: true, title: 'Report an Issue'}}
          />
          <Stack.Screen
            name="ReceiptScreen"
            component={ReceiptScreen}
            options={{headerShown: true, title: 'Receipt'}}
          />
          <Stack.Screen
            name="CashReportScreen"
            component={CashInHandScreen}
            options={{headerShown: true, title: 'Cash Report'}}
          />
          <Stack.Screen
            name="SettingScreen"
            component={SettingsScreen}
            options={{headerShown: true, title: 'Settings'}}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});

export default MainNavigator;
