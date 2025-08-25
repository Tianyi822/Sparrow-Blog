/**
 * 本地存储工具函数
 * 统一管理 localStorage 和 sessionStorage 的操作
 */

/**
 * localStorage 操作工具
 */
export const localStorage = {
  /**
   * 设置 localStorage 项
   * @param key 键名
   * @param value 值
   */
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage.setItem error:', error);
    }
  },

  /**
   * 获取 localStorage 项
   * @param key 键名
   * @returns 值或 null
   */
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage.getItem error:', error);
      return null;
    }
  },

  /**
   * 移除 localStorage 项
   * @param key 键名
   */
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage.removeItem error:', error);
    }
  },

  /**
   * 清空 localStorage
   */
  clear: (): void => {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('localStorage.clear error:', error);
    }
  },

  /**
   * 检查 localStorage 中是否存在指定键
   * @param key 键名
   * @returns 是否存在
   */
  hasItem: (key: string): boolean => {
    try {
      return window.localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('localStorage.hasItem error:', error);
      return false;
    }
  }
};

/**
 * sessionStorage 操作工具
 */
export const sessionStorage = {
  /**
   * 设置 sessionStorage 项
   * @param key 键名
   * @param value 值
   */
  setItem: (key: string, value: string): void => {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('sessionStorage.setItem error:', error);
    }
  },

  /**
   * 获取 sessionStorage 项
   * @param key 键名
   * @returns 值或 null
   */
  getItem: (key: string): string | null => {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      console.error('sessionStorage.getItem error:', error);
      return null;
    }
  },

  /**
   * 移除 sessionStorage 项
   * @param key 键名
   */
  removeItem: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error('sessionStorage.removeItem error:', error);
    }
  },

  /**
   * 清空 sessionStorage
   */
  clear: (): void => {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('sessionStorage.clear error:', error);
    }
  },

  /**
   * 检查 sessionStorage 中是否存在指定键
   * @param key 键名
   * @returns 是否存在
   */
  hasItem: (key: string): boolean => {
    try {
      return window.sessionStorage.getItem(key) !== null;
    } catch (error) {
      console.error('sessionStorage.hasItem error:', error);
      return false;
    }
  }
};

/**
 * JSON 数据存储工具
 */
export const jsonStorage = {
  /**
   * 设置 JSON 数据到 localStorage
   * @param key 键名
   * @param value 要存储的对象
   */
  setItem: <T>(key: string, value: T): void => {
    try {
      const jsonString = JSON.stringify(value);
      localStorage.setItem(key, jsonString);
    } catch (error) {
      console.error('jsonStorage.setItem error:', error);
    }
  },

  /**
   * 从 localStorage 获取 JSON 数据
   * @param key 键名
   * @returns 解析后的对象或 null
   */
  getItem: <T>(key: string): T | null => {
    try {
      const jsonString = localStorage.getItem(key);
      if (jsonString === null) return null;
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('jsonStorage.getItem error:', error);
      return null;
    }
  },

  /**
   * 移除 localStorage 中的 JSON 数据
   * @param key 键名
   */
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  }
};