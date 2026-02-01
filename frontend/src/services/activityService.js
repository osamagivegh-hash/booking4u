import api from './api';

/**
 * Activity Monitoring API Service
 * Provides methods to fetch activity data for the admin dashboard
 */

const activityService = {
    /**
     * Get dashboard overview data
     * @param {Object} params - Query parameters (startDate, endDate, period)
     */
    getDashboard: async (params = {}) => {
        const response = await api.get('/activity/dashboard', { params });
        return response.data;
    },

    /**
     * Get activity logs with filters and pagination
     * @param {Object} params - Query parameters
     */
    getLogs: async (params = {}) => {
        const response = await api.get('/activity/logs', { params });
        return response.data;
    },

    /**
     * Get user activity details
     * @param {string} userId - User ID
     * @param {Object} params - Query parameters
     */
    getUserActivity: async (userId, params = {}) => {
        const response = await api.get(`/activity/users/${userId}`, { params });
        return response.data;
    },

    /**
     * Get session timeline
     * @param {string} sessionId - Session ID
     */
    getSessionTimeline: async (sessionId) => {
        const response = await api.get(`/activity/sessions/${sessionId}`);
        return response.data;
    },

    /**
     * Get security reports
     * @param {Object} params - Query parameters
     */
    getSecurityReports: async (params = {}) => {
        const response = await api.get('/activity/security', { params });
        return response.data;
    },

    /**
     * Unblock an IP address or identifier
     * @param {Object} data - { ipAddress, identifier }
     */
    unblockIP: async (data) => {
        const response = await api.post('/activity/security/unblock', data);
        return response.data;
    },

    /**
     * Get action type breakdown
     * @param {Object} params - Query parameters
     */
    getBreakdown: async (params = {}) => {
        const response = await api.get('/activity/breakdown', { params });
        return response.data;
    },

    /**
     * Export activity logs
     * @param {Object} params - Query parameters (format: 'json' or 'csv')
     */
    exportLogs: async (params = {}) => {
        const response = await api.get('/activity/export', {
            params,
            responseType: params.format === 'csv' ? 'blob' : 'json'
        });
        return response.data;
    }
};

export default activityService;
