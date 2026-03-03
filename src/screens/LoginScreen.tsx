import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SVG_ICONS} from '../assets/icons/svg';
import Icon from '../utilities/Icon';
import Dropdown from '../components/DropDownComponent';
import {useAuthStore} from '../store/useAuthStore'; // Path to your store
import {useToast} from '../utilities/ToastContext';
import api from '../api/axiosConfig';

const {height, width} = Dimensions.get('window');

const LoginScreen = ({navigation}: any) => {
  const insets = useSafeAreaInsets();
  const {showToast} = useToast();
  const loginStore = useAuthStore(state => state.login);

  const [role, setRole] = useState<string>('agent');
  const [agentId, setAgentId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    // Basic Validation
    if (!agentId || !password) {
      showToast('Please enter both Agent ID and Password', 'error');
      return;
    }

    setIsLoggingIn(true);

    try {
            console.log(agentId, password);
      const response = await api.post('orders/agent/login/', {
        username: agentId,
        password: password,
        // role: role,
      });

      

      if (response.data.message === 'Success') {
        const {access, refresh, agent} = response.data.results.data;

        // Inject role into the agent object for local storage reference
        const userData = {...agent, role};

        // Save to Zustand and AsyncStorage
        await loginStore(userData, access, refresh);

        showToast('Login Successful!', 'success');
        // Navigation is usually handled automatically by the Root Navigator
        // listening to the 'token' state in your AuthStore.
        // If not, use: navigation.replace('MainTabs');
      } else {
        showToast(response.data.message || 'Login Failed', 'error');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      const errorMsg =
        error.response?.data?.message || 'Invalid credentials or server error';
      showToast(errorMsg, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}>
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Icon xml={SVG_ICONS.truckIcon} size={35} color="white" />
            </View>
            <Text style={styles.brandName}>HORECA HUB</Text>
            <Text style={styles.brandSub}>DELIVERY PARTNER</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to manage your deliveries
            </Text>

            <View style={styles.form}>
              <Text style={styles.inputLabel}>CHOOSE YOUR ROLE</Text>
              <Dropdown
                options={[
                  {id: 'agent', name: 'Delivery Agent'},
                  {id: 'vansale', name: 'Van Sale User'},
                ]}
                value={role}
                onChange={item => setRole(item.id)}
              />

              <Text style={styles.inputLabel}>AGENT ID / EMAIL</Text>
              <View style={styles.inputBox}>
                <Icon xml={SVG_ICONS.userIcon} size={18} color="#94A3B8" />
                <TextInput
                  style={styles.textInput}
                  value={agentId}
                  onChangeText={setAgentId}
                  placeholder="driver@gmail.com"
                  placeholderTextColor="#CBD5E1"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputBox}>
                <Icon xml={SVG_ICONS.shieldIcon} size={18} color="#94A3B8" />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#CBD5E1"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoggingIn && {opacity: 0.7}]}
                onPress={handleLogin}
                disabled={isLoggingIn}
                activeOpacity={0.8}>
                {isLoggingIn ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>LOGIN NOW</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.copyright}>© 2026 HORECA HUB SOLUTIONS</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// Styles remain exactly as you provided
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#DC2626'},
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  card: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
    marginLeft: 10,
  },
  primaryButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    shadowColor: '#DC2626',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  copyright: {
    marginTop: 20,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default LoginScreen;
