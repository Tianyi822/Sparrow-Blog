/**
 * 评论相关类型定义
 */

// 评论接口
export interface Comment {
    comment_id: string;
    commenter_email: string;
    blog_id: string;
    blog_title: string;
    content: string;
    create_time: string;
    origin_post_id?: string;
    reply_to_commenter?: string;
    sub_comments?: Comment[];
}

// 评论项目接口（管理端使用）
export interface CommentItem {
    comment_id: string;
    commenter_email: string;
    blog_id: string;
    blog_title: string;
    content: string;
    create_time: string;
    origin_post_id?: string;
    reply_to_commenter?: string;
}

// 添加评论数据接口
export interface AddCommentData {
    commenter_email: string;
    blog_id: string;
    content: string;
}

// 回复评论数据接口
export interface ReplyCommentData {
    commenter_email: string;
    blog_id: string;
    reply_to_comment_id: string;
    content: string;
}

// 评论响应接口
export interface CommentsResponse {
    code: number;
    msg: string;
    data: CommentItem[];
}

// 单个评论响应类型
export type CommentResponse = import('./api').ApiResponse<Comment>;

// 评论列表响应类型（前台使用）
export type CommentsListResponse = import('./api').ApiResponse<Comment[]>;