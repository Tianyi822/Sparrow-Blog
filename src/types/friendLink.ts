/**
 * 友链相关类型定义
 */

// 友链接口
export interface FriendLink {
    friend_link_id: string;
    friend_link_name: string;
    friend_link_url: string;
    friend_avatar_url: string;
    friend_describe: string;
    display: boolean;
}

// 友链项目接口（管理端使用）
export interface FriendLinkItem {
    friend_link_id: string;
    friend_link_name: string;
    friend_link_url: string;
    friend_avatar_url: string;
    friend_describe: string;
    display: boolean;
}

// 友链申请数据接口
export interface FriendLinkApplicationData {
    friend_link_name: string;
    friend_link_url: string;
    friend_avatar_url?: string;
    friend_describe?: string;
}

// 添加友链请求接口
export interface AddFriendLinkRequest {
    friend_link_name: string;
    friend_link_url: string;
    friend_avatar_url: string;
    friend_describe: string;
    display: boolean;
}

// 更新友链请求接口
export interface UpdateFriendLinkRequest {
    friend_link_id: string;
    friend_link_name: string;
    friend_link_url: string;
    friend_avatar_url: string;
    friend_describe: string;
}

// 友链申请响应接口
export interface FriendLinkApplicationResponse {
    code: number;
    msg: string;
    data: null;
}

// 友链列表响应接口
export interface FriendLinksResponse {
    code: number;
    msg: string;
    data: FriendLinkItem[];
}

// 切换显示状态响应接口
export interface ToggleDisplayResponse {
    code: number;
    msg: string;
    data: {
        display: boolean;
    };
}

// 友链响应类型
export type FriendLinksListResponse = import('./api').ApiResponse<FriendLink[]>;
export type FriendLinkApplyResponse = import('./api').ApiResponse<null>;