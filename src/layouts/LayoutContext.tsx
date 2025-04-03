import { createContext } from "react";

// 定义上下文类型
export interface LayoutContextType {
  collapsed: boolean;
  isLayoutTransitioning: boolean;
}

export const LayoutContext = createContext<LayoutContextType>({
    collapsed: false,
    isLayoutTransitioning: false
});