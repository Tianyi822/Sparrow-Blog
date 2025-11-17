import { create } from 'zustand';
import { Notification, UIActions, UIState } from './types';

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  (set, get) => ({
    // 状态
    sidebarOpen: false,
    sidebarCollapsed: false,
    isLayoutTransitioning: false,
    searchModalOpen: false,
    imageModalOpen: false,
    loading: false,
    notifications: [],
    imageModalData: null,

    // 操作
    toggleSidebar: () => {
      set((state) => ({ sidebarOpen: !state.sidebarOpen }));
    },

    setSidebarOpen: (open: boolean) => {
      set({ sidebarOpen: open });
    },

    setSidebarCollapsed: (collapsed: boolean) => {
      set({ sidebarCollapsed: collapsed });
    },

    setLayoutTransitioning: (transitioning: boolean) => {
      set({ isLayoutTransitioning: transitioning });
    },

    toggleSearchModal: () => {
      set((state) => ({ searchModalOpen: !state.searchModalOpen }));
    },

    setSearchModalOpen: (open: boolean) => {
      set({ searchModalOpen: open });
    },

    toggleImageModal: () => {
      set((state) => ({ imageModalOpen: !state.imageModalOpen }));
    },

    setImageModalOpen: (open: boolean) => {
      set({ imageModalOpen: open });
    },

    setLoading: (loading: boolean) => {
      set({ loading });
    },

    setImageModalData: (data) => {
      set({ imageModalData: data });
    },

    openImageModal: (src, position) => {
      set({
        imageModalOpen: true,
        imageModalData: {
          src,
          position,
          isZooming: true,
          isClosing: false,
          isVisible: false,
        },
      });
    },

    closeImageModal: () => {
      set((state) => ({
        imageModalData: state.imageModalData
          ? {
            ...state.imageModalData,
            isClosing: true,
            isVisible: false,
          }
          : null,
      }));
    },

    addNotification: (notificationData) => {
      const notification: Notification = {
        ...notificationData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };

      const { notifications } = get();
      set({ notifications: [...notifications, notification] });

      // 自动移除通知（如果设置了持续时间）
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          get().removeNotification(notification.id);
        }, notification.duration);
      }
    },

    removeNotification: (id: string) => {
      const { notifications } = get();
      set({
        notifications: notifications.filter((notification) => notification.id !== id),
      });
    },

    clearNotifications: () => {
      set({ notifications: [] });
    },
  }),
);
