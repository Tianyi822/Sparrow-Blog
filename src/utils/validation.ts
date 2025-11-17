/**
 * 验证工具函数
 * 统一管理各种数据验证逻辑
 */

/**
 * 邮箱验证
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * URL 验证
 * @param url URL 地址
 * @returns 是否为有效 URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 手机号验证（中国大陆）
 * @param phone 手机号
 * @returns 是否为有效手机号
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 密码强度验证
 * @param password 密码
 * @returns 密码强度等级 (weak, medium, strong)
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';

  let score = 0;

  // 长度检查
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // 字符类型检查
  if (/[a-z]/.test(password)) score++; // 小写字母
  if (/[A-Z]/.test(password)) score++; // 大写字母
  if (/\d/.test(password)) score++; // 数字
  if (/[^\w\s]/.test(password)) score++; // 特殊字符

  if (score < 3) return 'weak';
  if (score < 5) return 'medium';
  return 'strong';
};

/**
 * 身份证号验证（中国大陆）
 * @param idCard 身份证号
 * @returns 是否为有效身份证号
 */
export const isValidIdCard = (idCard: string): boolean => {
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  return idCardRegex.test(idCard);
};

/**
 * IP 地址验证
 * @param ip IP 地址
 * @returns 是否为有效 IP 地址
 */
export const isValidIP = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

/**
 * 端口号验证
 * @param port 端口号
 * @returns 是否为有效端口号
 */
export const isValidPort = (port: string | number): boolean => {
  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
};

/**
 * 文件名验证
 * @param filename 文件名
 * @returns 是否为有效文件名
 */
export const isValidFilename = (filename: string): boolean => {
  // 不能包含特殊字符
  const invalidChars = /[<>:"/\\|?*]/;
  return !invalidChars.test(filename) && filename.trim().length > 0;
};

/**
 * 数字范围验证
 * @param value 值
 * @param min 最小值
 * @param max 最大值
 * @returns 是否在范围内
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * 字符串长度验证
 * @param str 字符串
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @returns 是否在长度范围内
 */
export const isValidLength = (str: string, minLength: number, maxLength: number): boolean => {
  return str.length >= minLength && str.length <= maxLength;
};

/**
 * 必填字段验证
 * @param value 值
 * @returns 是否为空
 */
export const isRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * 数字验证
 * @param value 值
 * @returns 是否为有效数字
 */
export const isValidNumber = (value: unknown): boolean => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

/**
 * 整数验证
 * @param value 值
 * @returns 是否为整数
 */
export const isInteger = (value: unknown): boolean => {
  return Number.isInteger(Number(value));
};

/**
 * 正数验证
 * @param value 值
 * @returns 是否为正数
 */
export const isPositive = (value: number): boolean => {
  return value > 0;
};

/**
 * 非负数验证
 * @param value 值
 * @returns 是否为非负数
 */
export const isNonNegative = (value: number): boolean => {
  return value >= 0;
};
