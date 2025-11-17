/**
 * 格式化工具函数
 * 统一管理日期、数字、字符串等格式化操作
 */

/**
 * 日期格式化工具
 */
export const dateFormat = {
  /**
   * 格式化日期为 YYYY年MM月DD日 HH:mm 格式
   * @param dateString 日期字符串
   * @returns 格式化后的日期字符串
   */
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${year}年${pad(month)}月${pad(day)}日 ${pad(hour)}:${pad(minute)}`;
  },

  /**
   * 格式化日期时间为 YYYY-MM-DD HH:mm:ss 格式
   * @param dateStr 日期字符串
   * @returns 格式化后的日期时间字符串
   */
  formatDateTime: (dateStr: string): string => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  /**
   * 格式化日期为 YYYY-MM-DD 格式
   * @param dateString 日期字符串
   * @returns 格式化后的日期字符串
   */
  formatDateOnly: (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  },

  /**
   * 格式化时间为 HH:mm:ss 格式
   * @param dateString 日期字符串
   * @returns 格式化后的时间字符串
   */
  formatTimeOnly: (dateString: string): string => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  },
};

/**
 * 数字格式化工具
 */
export const numberFormat = {
  /**
   * 数字转字符串（保持原有的 toString 行为）
   * @param num 数字
   * @returns 字符串
   */
  toString: (num: number): string => {
    return num.toString();
  },

  /**
   * 数字补零
   * @param num 数字
   * @param length 目标长度
   * @returns 补零后的字符串
   */
  padStart: (num: number, length: number = 2): string => {
    return num.toString().padStart(length, '0');
  },

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化后的文件大小字符串
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * 格式化数字为千分位格式
   * @param num 数字
   * @returns 千分位格式的字符串
   */
  formatThousands: (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
};

/**
 * 字符串格式化工具
 */
export const stringFormat = {
  /**
   * 截断字符串
   * @param str 原字符串
   * @param length 最大长度
   * @param suffix 后缀（默认为 '...'）
   * @returns 截断后的字符串
   */
  truncate: (str: string, length: number, suffix: string = '...'): string => {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },

  /**
   * 首字母大写
   * @param str 字符串
   * @returns 首字母大写的字符串
   */
  capitalize: (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * 驼峰命名转换为短横线命名
   * @param str 驼峰命名字符串
   * @returns 短横线命名字符串
   */
  camelToKebab: (str: string): string => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  },

  /**
   * 短横线命名转换为驼峰命名
   * @param str 短横线命名字符串
   * @returns 驼峰命名字符串
   */
  kebabToCamel: (str: string): string => {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  },
};

/**
 * 通用格式化工具（向后兼容）
 */
export const formatDate = dateFormat.formatDate;
export const formatDateTime = dateFormat.formatDateTime;
export const pad = numberFormat.padStart;
