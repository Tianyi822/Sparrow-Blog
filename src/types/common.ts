/**
 * 通用类型定义
 */

// 通用响应状态
export type ResponseStatus = 'success' | 'error' | 'loading';

// 通用分页参数
export interface PaginationParams {
    page: number;
    pageSize: number;
    total?: number;
}

// 通用分页响应
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// 通用排序参数
export interface SortParams {
    field: string;
    order: 'asc' | 'desc';
}

// 通用筛选参数
export interface FilterParams {
    [key: string]: string | number | boolean | undefined;
}

// 通用表单状态
export interface FormState<T> {
    data: T;
    errors: Partial<Record<keyof T, string>>;
    isSubmitting: boolean;
    isDirty: boolean;
}

// 通用模态框状态
export interface ModalState {
    isOpen: boolean;
    title?: string;
    content?: React.ReactNode;
    onConfirm?: () => void;
    onCancel?: () => void;
}

// 通用加载状态
export interface LoadingState {
    isLoading: boolean;
    error?: string | null;
}

// 通用操作结果
export interface OperationResult {
    success: boolean;
    message?: string;
    data?: unknown;
}

// 通用选项接口
export interface Option<T = string> {
    label: string;
    value: T;
    disabled?: boolean;
}

// 通用树形结构
export interface TreeNode<T = unknown> {
    id: string;
    label: string;
    children?: TreeNode<T>[];
    data?: T;
    expanded?: boolean;
    selected?: boolean;
}

// 通用文件信息
export interface FileInfo {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    url?: string;
}

// 通用上传状态
export interface UploadStatus {
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
}

// 通用主题配置
export interface ThemeConfig {
    mode: 'light' | 'dark' | 'auto';
    primaryColor: string;
    fontSize: 'small' | 'medium' | 'large';
}

// 通用设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// 通用断点
export interface Breakpoints {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
}

// 通用尺寸
export type Size = 'small' | 'medium' | 'large';

// 通用颜色类型
export type ColorType = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// 通用位置类型
export type Position = 'top' | 'bottom' | 'left' | 'right' | 'center';

// 通用对齐方式
export type Alignment = 'start' | 'center' | 'end' | 'stretch';

// 通用方向
export type Direction = 'horizontal' | 'vertical';

// React相关通用类型
export type ReactChildren = React.ReactNode | React.ReactNode[];

// 事件处理器类型
export type EventHandler<T = Event> = (event: T) => void;

// 异步函数类型
export type AsyncFunction<T = void, P extends unknown[] = []> = (...args: P) => Promise<T>;

// 可选的异步函数类型
export type OptionalAsyncFunction<T = void, P extends unknown[] = []> = ((...args: P) => Promise<T>) | undefined;

// 键值对类型
export type KeyValuePair<K extends string | number | symbol = string, V = unknown> = Record<K, V>;

// 深度可选类型
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 深度必需类型
export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};