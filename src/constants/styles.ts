/**
 * 样式相关常量定义
 */

// CSS 类名常量
export const CSS_CLASSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  HIDDEN: 'hidden',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  SELECTED: 'selected',
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
} as const;

// 颜色常量
export const COLORS = {
  PRIMARY: '#007bff',
  SECONDARY: '#6c757d',
  SUCCESS: '#28a745',
  DANGER: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#17a2b8',
  LIGHT: '#f8f9fa',
  DARK: '#343a40',
  WHITE: '#ffffff',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
} as const;

// 字体大小常量
export const FONT_SIZES = {
  XS: '0.75rem',
  SM: '0.875rem',
  BASE: '1rem',
  LG: '1.125rem',
  XL: '1.25rem',
  '2XL': '1.5rem',
  '3XL': '1.875rem',
  '4XL': '2.25rem',
} as const;

// 间距常量
export const SPACING = {
  XS: '0.25rem',
  SM: '0.5rem',
  MD: '1rem',
  LG: '1.5rem',
  XL: '2rem',
  '2XL': '3rem',
  '3XL': '4rem',
} as const;

// 边框半径常量
export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.125rem',
  DEFAULT: '0.25rem',
  MD: '0.375rem',
  LG: '0.5rem',
  XL: '0.75rem',
  '2XL': '1rem',
  FULL: '9999px',
} as const;

// 阴影常量
export const SHADOWS = {
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  INNER: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// Z-index 层级常量
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;

// 过渡动画常量
export const TRANSITIONS = {
  FAST: '150ms ease-in-out',
  DEFAULT: '300ms ease-in-out',
  SLOW: '500ms ease-in-out',
} as const;

// 图标大小常量
export const ICON_SIZES = {
  XS: '12px',
  SM: '16px',
  MD: '20px',
  LG: '24px',
  XL: '32px',
} as const;
