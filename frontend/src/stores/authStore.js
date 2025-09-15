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
        console.log('🔍 Auth Store: LOGIN START - Setting loading state');
        set({ isLoading: true, error: null });
        try {
          console.log('🔍 Auth Store: Attempting login with credentials:', credentials);
          console.log('🔍 Auth Store: Current API base URL:', api.defaults.baseURL);
          console.log('🔍 Auth Store: Current headers:', api.defaults.headers);
          
          const response = await api.post('/auth/login', credentials);
          console.log('🔍 Auth Store: Login response received:', response.data);
          console.log('🔍 Auth Store: Response headers:', response.headers);
          
          const { user, token } = response.data.data;
          
          console.log('🔍 Auth Store: Extracted user and token:', { 
            userId: user?.id, 
            userEmail: user?.email, 
            tokenLength: token?.length,
            tokenPreview: token?.substring(0, 20) + '...'
          });
          
          console.log('🔍 Auth Store: Setting user data in store');
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('🔍 Auth Store: Token set in API headers');
          console.log('🔍 Auth Store: Updated API headers:', api.defaults.headers);
          console.log('🔍 Auth Store: LOGIN SUCCESS - Returning result');
          
          return { success: true, user };
        } catch (error) {
          console.error('🔍 Auth Store: LOGIN ERROR:', error);
          console.error('🔍 Auth Store: Error response:', error.response?.data);
          console.error('🔍 Auth Store: Error status:', error.response?.status);
          
          const errorMessage = error.response?.data?.message || 'حدث خطأ في تسجيل الدخول';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      register: async (userData) => {
        console.log('🔍 Auth Store: REGISTER START - Setting loading state');
        set({ isLoading: true, error: null });
        try {
          console.log('🔍 Auth Store: Attempting registration with userData:', { ...userData, password: '[HIDDEN]' });
          console.log('🔍 Auth Store: Current API base URL:', api.defaults.baseURL);
          
          const response = await api.post('/auth/register', userData);
          console.log('🔍 Auth Store: Registration response received:', response.data);
          
          const { user, token } = response.data.data;
          
          console.log('🔍 Auth Store: Extracted user and token from registration:', { 
            userId: user?.id, 
            userEmail: user?.email, 
            tokenLength: token?.length,
            tokenPreview: token?.substring(0, 20) + '...'
          });
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('🔍 Auth Store: REGISTER SUCCESS - Token set in headers');
          
          return { success: true, user };
        } catch (error) {
          console.error('🔍 Auth Store: REGISTER ERROR:', error);
          console.error('🔍 Auth Store: Error response:', error.response?.data);
          console.error('🔍 Auth Store: Error status:', error.response?.status);
          
          const errorMessage = error.response?.data?.message || 'حدث خطأ في التسجيل';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        console.log('🔍 Auth Store: LOGOUT - Clearing auth state');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Remove token from API headers
        delete api.defaults.headers.common['Authorization'];
        console.log('🔍 Auth Store: LOGOUT - Token removed from headers');
      },

      // COMPLETELY DISABLED: No auth initialization to prevent backend components
      initializeAuth: async () => {
        console.log('🛡️ Auth Store: Auth initialization completely disabled to prevent backend components');
        
        // Set unauthenticated state without making any API calls
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitializing: false,
          error: null,
        });
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
