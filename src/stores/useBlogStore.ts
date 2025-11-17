import { create } from 'zustand';
import { Article, BlogActions, BlogState, Comment } from './types';

type BlogStore = BlogState & BlogActions;

export const useBlogStore = create<BlogStore>()(
  (set, get) => ({
    // 状态
    articles: [],
    currentArticle: null,
    comments: [],
    categories: [],
    tags: [],
    isLoading: false,
    error: null,

    // 操作
    fetchArticles: async () => {
      set({ isLoading: true, error: null });
      try {
        // 这里应该调用实际的 API
        // const response = await blogAPI.getArticles(params);
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 模拟文章数据
        const mockArticles: Article[] = [
          {
            id: '1',
            title: '示例文章标题',
            content: '这是文章的内容...',
            summary: '这是文章的摘要',
            author: 'admin',
            tags: ['技术', 'React'],
            category: '前端开发',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            viewCount: 100,
            likeCount: 10,
            commentCount: 5,
            isPublished: true,
          },
        ];

        set({
          articles: mockArticles,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '获取文章列表失败',
          isLoading: false,
        });
      }
    },

    fetchArticle: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        // 这里应该调用实际的 API
        // const response = await blogAPI.getArticle(id);
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 800));

        const { articles } = get();
        const article = articles.find((a) => a.id === id);

        if (article) {
          set({
            currentArticle: article,
            isLoading: false,
          });
        } else {
          throw new Error('文章不存在');
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '获取文章详情失败',
          isLoading: false,
        });
      }
    },

    createArticle: async (articleData) => {
      set({ isLoading: true, error: null });
      try {
        // 这里应该调用实际的 API
        // const response = await blogAPI.createArticle(articleData);
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newArticle: Article = {
          ...articleData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
        };

        const { articles } = get();
        set({
          articles: [newArticle, ...articles],
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '创建文章失败',
          isLoading: false,
        });
      }
    },

    updateArticle: async (id: string, articleData) => {
      set({ isLoading: true, error: null });
      try {
        // 这里应该调用实际的 API
        // const response = await blogAPI.updateArticle(id, articleData);
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 800));

        const { articles, currentArticle } = get();
        const updatedArticles = articles.map((article) =>
          article.id === id ? { ...article, ...articleData, updatedAt: new Date().toISOString() } : article
        );

        const updatedCurrentArticle = currentArticle?.id === id
          ? { ...currentArticle, ...articleData, updatedAt: new Date().toISOString() }
          : currentArticle;

        set({
          articles: updatedArticles,
          currentArticle: updatedCurrentArticle,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '更新文章失败',
          isLoading: false,
        });
      }
    },

    deleteArticle: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        // 这里应该调用实际的 API
        // await blogAPI.deleteArticle(id);
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { articles, currentArticle } = get();
        const filteredArticles = articles.filter((article) => article.id !== id);
        const updatedCurrentArticle = currentArticle?.id === id ? null : currentArticle;

        set({
          articles: filteredArticles,
          currentArticle: updatedCurrentArticle,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '删除文章失败',
          isLoading: false,
        });
      }
    },

    fetchComments: async (articleId: string) => {
      set({ isLoading: true, error: null });
      try {
        // 这里应该调用实际的 API
        // const response = await blogAPI.getComments(articleId);
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 600));

        // 模拟评论数据
        const mockComments: Comment[] = [
          {
            id: '1',
            articleId,
            author: '访客',
            content: '这是一条评论',
            createdAt: new Date().toISOString(),
          },
        ];

        set({
          comments: mockComments,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '获取评论失败',
          isLoading: false,
        });
      }
    },

    addComment: async (commentData) => {
      set({ isLoading: true, error: null });
      try {
        // 这里应该调用实际的 API
        // const response = await blogAPI.addComment(commentData);
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newComment: Comment = {
          ...commentData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };

        const { comments } = get();
        set({
          comments: [...comments, newComment],
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '添加评论失败',
          isLoading: false,
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },
  }),
);
