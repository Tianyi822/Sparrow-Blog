import { apiRequest, ApiResponse } from './api';

// Types for web status
interface WebStatusData {
    status: 'RUNTIME_ENV' | 'CONFIG_SERVER_ENV';
}

type WebStatus = ApiResponse<WebStatusData>;

/**
 * Get web server status
 */
export const getWebStatus = async (): Promise<WebStatus> => {
    return apiRequest<WebStatus>({
        method: 'GET',
        url: '/web/status'
    });
};

export default {
    getWebStatus
};