import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserState, UserActions } from './types';

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 操作
      login: async (credentials: { username: string; password: string }) => {
        set({ isLoading: true, error: null });
        try {
          // 这里应该调用实际的登录 API
          // const response = await authAPI.login(credentials);
          // 模拟 API 调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 模拟用户数据
          const mockUser: User = {
            id: '1',
            username: credentials.username,
            email: `${credentials.username}@example.com`,
            role: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '登录失败', 
            isLoading: false 
          });
        }
      },

      logout: () => {
        // 清除本地存储的 token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },

      setUser: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true,
          error: null 
        });
      },

      updateUser: async (userData: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          // 这里应该调用实际的更新用户 API
          // const response = await userAPI.update(user.id, userData);
          // 模拟 API 调用
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedUser = {
            ...user,
            ...userData,
            updatedAt: new Date().toISOString(),
          };

          set({ 
            user: updatedUser, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '更新用户信息失败', 
            isLoading: false 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state: UserStore) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);