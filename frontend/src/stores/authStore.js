import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitializing: false, // New state for initialization tracking

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔍 Auth Store: Attempting login with credentials:', credentials);
          const response = await api.post('/auth/login', credentials);
          console.log('🔍 Auth Store: Login response:', response.data);
          const { user, token } = response.data.data;
          
          console.log('🔍 Auth Store: Setting user data:', { user, token });
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('🔍 Auth Store: Login successful, returning result');
          
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'حدث خطأ في تسجيل الدخول';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          const { user, token } = response.data.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'حدث خطأ في التسجيل';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Remove token from API headers
        delete api.defaults.headers.common['Authorization'];
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put('/auth/profile', profileData);
          const { user } = response.data.data;
          
          set({
            user,
            isLoading: false,
            error: null,
          });
          
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'حدث خطأ في تحديث الملف الشخصي';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      changePassword: async (passwordData) => {
        set({ isLoading: true, error: null });
        try {
          await api.put('/auth/change-password', passwordData);
          set({
            isLoading: false,
            error: null,
          });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'حدث خطأ في تغيير كلمة المرور';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/auth/me');
          const { user } = response.data.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return user;
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          // Remove token from API headers
          delete api.defaults.headers.common['Authorization'];
          
          throw error;
        }
      },

      initializeAuth: async () => {
        const { token, isInitializing } = get();
        
        // STRICT GUARD: If already initializing or no token, exit immediately
        if (isInitializing || !token) {
          console.log('🔍 Auth Store: Skipping initialization - already initializing or no token');
          return;
        }
        
        // Add a small delay to prevent rapid successive calls
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Double-check the state after delay
        const currentState = get();
        if (currentState.isInitializing || !currentState.token) {
          console.log('🔍 Auth Store: Skipping initialization - state changed during delay');
          return;
        }
        
        console.log('🔍 Auth Store: Starting auth initialization');
        
        // Set initializing flag IMMEDIATELY to prevent any other calls
        set({ isInitializing: true });
        
        try {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Make the API call with a strict timeout
          const response = await Promise.race([
            api.get('/auth/me'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 10000)
            )
          ]);
          
          const { user } = response.data.data;
          
          // Update state with user data
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isInitializing: false, // Reset flag
          });
          
          console.log('✅ Auth Store: Auth initialization successful');
          
        } catch (error) {
          console.log('❌ Auth Store: Auth initialization failed:', error.message);
          
          // Clear everything and reset flags
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isInitializing: false, // Reset flag
          });
          
          // Remove token from API headers
          delete api.defaults.headers.common['Authorization'];
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Getters
      getUserRole: () => {
        const { user } = get();
        return user?.role;
      },

      isBusinessOwner: () => {
        const { user } = get();
        return user?.role === 'business';
      },

      isCustomer: () => {
        const { user } = get();
        return user?.role === 'customer';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
