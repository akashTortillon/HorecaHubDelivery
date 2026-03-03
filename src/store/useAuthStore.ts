import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Updated to match your API "agent" object
interface User {
  id: string;
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  vehicle_type: string;
  vehicle_registration: string;
  status: string;
  role?: string; // We can inject the selected role here
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  bootstrap: () => Promise<void>;
  login: (userData: User, token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  token: null,
  refreshToken: null,
  user: null,
  isLoading: true,

  bootstrap: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userData = await AsyncStorage.getItem('userData');
      set({
        token,
        refreshToken,
        user: userData ? JSON.parse(userData) : null,
        isLoading: false,
      });
    } catch (e) {
      set({isLoading: false});
    }
  },

  login: async (userData, token, refreshToken) => {
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    set({token, refreshToken, user: userData});
  },

  logout: async () => {
    await AsyncStorage.clear(); // Clears all for safety
    set({token: null, refreshToken: null, user: null});
  },
}));
