import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeActions, ThemeMode, ThemeState } from './types';

type ThemeStore = ThemeState & ThemeActions;

// 检测系统主题偏好
const getSystemTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// 根据主题模式计算是否为暗色主题
const calculateIsDark = (mode: ThemeMode): boolean => {
  switch (mode) {
    case 'dark':
      return true;
    case 'light':
      return false;
    case 'auto':
      return getSystemTheme();
    default:
      return false;
  }
};

// 应用主题到 DOM
const applyTheme = (isDark: boolean) => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => {
      // 监听系统主题变化
      if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
          const { mode } = get();
          if (mode === 'auto') {
            const isDark = calculateIsDark(mode);
            set({ isDark });
            applyTheme(isDark);
          }
        };

        // 添加监听器
        mediaQuery.addEventListener('change', handleChange);
      }

      return {
        // 状态
        mode: 'auto' as ThemeMode,
        isDark: calculateIsDark('auto'),

        // 操作
        setTheme: (mode: ThemeMode) => {
          const isDark = calculateIsDark(mode);
          set({ mode, isDark });
          applyTheme(isDark);
        },

        toggleTheme: () => {
          const { mode } = get();
          let newMode: ThemeMode;

          switch (mode) {
            case 'light':
              newMode = 'dark';
              break;
            case 'dark':
              newMode = 'light';
              break;
            case 'auto':
              // 如果当前是自动模式，切换到与当前显示相反的主题
              newMode = get().isDark ? 'light' : 'dark';
              break;
            default:
              newMode = 'light';
          }

          const isDark = calculateIsDark(newMode);
          set({ mode: newMode, isDark });
          applyTheme(isDark);
        },
      };
    },
    {
      name: 'theme-storage',
      partialize: (state: ThemeStore) => ({
        mode: state.mode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 重新计算 isDark 状态并应用主题
          const isDark = calculateIsDark(state.mode);
          state.isDark = isDark;
          applyTheme(isDark);
        }
      },
    },
  ),
);

// 初始化主题
if (typeof window !== 'undefined') {
  // 确保在组件挂载时应用正确的主题
  const store = useThemeStore.getState();
  applyTheme(store.isDark);
}
