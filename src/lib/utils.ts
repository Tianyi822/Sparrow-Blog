// 这个文件通常用于 Aceternity UI 组件的工具函数

/**
 * 合并多个类名，主要用于组件样式的条件应用
 * @param classes 要合并的类名数组
 * @returns 合并后的类名字符串
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
} 