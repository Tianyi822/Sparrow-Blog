/**
 * 请求工具函数
 * 统一管理 HTTP 请求相关的工具函数
 */

/**
 * HTTP 状态码常量
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * 请求方法常量
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

/**
 * 内容类型常量
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
} as const;

/**
 * 构建查询字符串
 * @param params 参数对象
 * @returns 查询字符串
 */
export const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
};

/**
 * 解析查询字符串
 * @param queryString 查询字符串
 * @returns 参数对象
 */
export const parseQueryString = (queryString: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
};

/**
 * 构建完整的 URL
 * @param baseUrl 基础 URL
 * @param path 路径
 * @param params 查询参数
 * @returns 完整的 URL
 */
export const buildUrl = (baseUrl: string, path: string = '', params?: Record<string, unknown>): string => {
  let url = baseUrl;

  if (path) {
    url = url.endsWith('/') ? url + path.replace(/^\//, '') : url + '/' + path.replace(/^\//, '');
  }

  if (params && Object.keys(params).length > 0) {
    const queryString = buildQueryString(params);
    url += (url.includes('?') ? '&' : '?') + queryString;
  }

  return url;
};

/**
 * 检查响应状态是否成功
 * @param status HTTP 状态码
 * @returns 是否成功
 */
export const isSuccessStatus = (status: number): boolean => {
  return status >= 200 && status < 300;
};

/**
 * 检查是否为客户端错误
 * @param status HTTP 状态码
 * @returns 是否为客户端错误
 */
export const isClientError = (status: number): boolean => {
  return status >= 400 && status < 500;
};

/**
 * 检查是否为服务器错误
 * @param status HTTP 状态码
 * @returns 是否为服务器错误
 */
export const isServerError = (status: number): boolean => {
  return status >= 500 && status < 600;
};

/**
 * 获取错误信息
 * @param status HTTP 状态码
 * @returns 错误信息
 */
export const getErrorMessage = (status: number): string => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return '请求参数错误';
    case HTTP_STATUS.UNAUTHORIZED:
      return '未授权，请重新登录';
    case HTTP_STATUS.FORBIDDEN:
      return '禁止访问';
    case HTTP_STATUS.NOT_FOUND:
      return '请求的资源不存在';
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return '服务器内部错误';
    case HTTP_STATUS.BAD_GATEWAY:
      return '网关错误';
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return '服务不可用';
    default:
      if (isClientError(status)) {
        return '客户端请求错误';
      } else if (isServerError(status)) {
        return '服务器错误';
      }
      return '未知错误';
  }
};

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 重试函数
 * @param fn 要重试的函数
 * @param maxRetries 最大重试次数
 * @param delayMs 重试间隔（毫秒）
 * @returns Promise
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries) {
        throw lastError;
      }

      await delay(delayMs * Math.pow(2, i)); // 指数退避
    }
  }

  throw lastError!;
};

/**
 * 超时包装函数
 * @param promise Promise
 * @param timeoutMs 超时时间（毫秒）
 * @returns Promise
 */
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    }),
  ]);
};

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 限制时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
