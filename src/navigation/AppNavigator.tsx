import React, {useState, useEffect} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthStore} from '../store/useAuthStore';
import {SafeAreaProvider} from 'react-native-safe-area-context';

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
import CreateCashReceiptScreen from '../screens/CreateCashReciept';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  OrderDetails: {orderId: string; screenType: screenType};
  ActiveOrderDetails: {orderId: string};
  ReportScreeen: {
    orderId?: string; 
    orderNumber?: string; 
    viewMode: 'report' | 'credit_notes_only';
    orderItems?: any;
    customerName?: string;
  };
  ReceiptScreen: {orderId: string};
  CashReportScreen: undefined;
  SettingScreen: undefined;
  CreateCashReciept: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  const token = useAuthStore(state => state.token);
  const bootstrap = useAuthStore(state => state.bootstrap);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await bootstrap();
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
    <SafeAreaProvider>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {token === null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
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
            <Stack.Screen
              name="CreateCashReciept"
              component={CreateCashReceiptScreen}
              options={{headerShown: true, title: 'Create Receipt'}}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </SafeAreaProvider>
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