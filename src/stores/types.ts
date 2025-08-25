// 用户相关类型定义
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserActions {
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// 主题相关类型定义
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
}

export interface ThemeActions {
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// 博客数据相关类型定义
export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPublished: boolean;
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  content: string;
  createdAt: string;
  parentId?: string;
  replies?: Comment[];
}

export interface BlogState {
  articles: Article[];
  currentArticle: Article | null;
  comments: Comment[];
  categories: string[];
  tags: string[];
  isLoading: boolean;
  error: string | null;
}

export interface BlogActions {
  fetchArticles: (params?: { page?: number; category?: string; tag?: string }) => Promise<void>;
  fetchArticle: (id: string) => Promise<void>;
  createArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  fetchComments: (articleId: string) => Promise<void>;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  clearError: () => void;
}

// UI 状态相关类型定义
export interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isLayoutTransitioning: boolean;
  searchModalOpen: boolean;
  imageModalOpen: boolean;
  loading: boolean;
  notifications: Notification[];
  imageModalData: {
    src: string;
    position: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    isZooming: boolean;
    isClosing: boolean;
    isVisible: boolean;
  } | null;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLayoutTransitioning: (transitioning: boolean) => void;
  toggleSearchModal: () => void;
  setSearchModalOpen: (open: boolean) => void;
  toggleImageModal: () => void;
  setImageModalOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setImageModalData: (data: UIState['imageModalData']) => void;
  openImageModal: (src: string, position: { top: number; left: number; width: number; height: number }) => void;
  closeImageModal: () => void;
}