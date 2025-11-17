// 导入所有状态管理 hooks
import { useUserStore } from './useUserStore';
import { useThemeStore } from './useThemeStore';
import { useBlogStore } from './useBlogStore';
import { useUIStore } from './useUIStore';

// 导出所有状态管理 hooks
export { useUserStore } from './useUserStore';
export { useThemeStore } from './useThemeStore';
export { useBlogStore } from './useBlogStore';
export { useUIStore } from './useUIStore';

// 导出类型定义
export type {
  Article,
  BlogActions,
  BlogState,
  Comment,
  Notification,
  ThemeActions,
  ThemeMode,
  ThemeState,
  UIActions,
  UIState,
  User,
  UserActions,
  UserState,
} from './types';

// 导出组合 hooks（可选）
export const useStores = () => ({
  user: useUserStore(),
  theme: useThemeStore(),
  blog: useBlogStore(),
  ui: useUIStore(),
});
