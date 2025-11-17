/// <reference types="@types/node" />

// Deno 全局命名空间声明
declare namespace Deno {
  export function cwd(): string;
}

// 扩展 NodeJS.Timeout 类型兼容性
declare global {
  type DenoTimeout = number;

  namespace NodeJS {
    type Timeout = number | ReturnType<typeof setTimeout>;
  }
}

export {};
