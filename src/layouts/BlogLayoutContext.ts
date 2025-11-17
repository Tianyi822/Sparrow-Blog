import { useOutletContext } from 'react-router-dom';
import { BasicData } from '@/types';
import type { TOCItem } from '@/components/business/Tools/TOCModal/TOCModal';

// Define the type for our context
export type BlogLayoutContext = {
  homeData: BasicData | null;
  getImageUrl: (imageId: string) => string;
  // TOC 相关
  tocItems?: TOCItem[];
  setTocItems?: (items: TOCItem[]) => void;
};

// Create a hook for child components to access the context
export function useBlogLayoutContext() {
  return useOutletContext<BlogLayoutContext>();
}
