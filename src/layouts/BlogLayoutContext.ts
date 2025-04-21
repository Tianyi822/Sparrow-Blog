import { useOutletContext } from "react-router-dom";
import { BlogUserInfo } from "@/services/webService";

// Define the type for our context
export type BlogLayoutContext = {
  userInfo: BlogUserInfo | null;
  getImageUrl: (imageId: string) => string;
};

// Create a hook for child components to access the context
export function useBlogLayoutContext() {
  return useOutletContext<BlogLayoutContext>();
} 