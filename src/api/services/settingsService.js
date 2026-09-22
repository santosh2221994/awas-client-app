import client from '../client';
import { ENDPOINTS } from '../endpoints';

export const settingsService = {
  /**
   * Fetch all user settings, organization, preferences, and security state
   */
  async getSettings() {
    return client.get(ENDPOINTS.SETTINGS);
  },

  /**
   * Update personal profile information (name, jobTitle, bio, avatarUrl)
   */
  async updateProfile(data) {
    return client.patch(ENDPOINTS.SETTINGS_PROFILE, data);
  },

  /**
   * Update or create organization settings (name, slug, website, industry)
   */
  async updateOrganization(data) {
    return client.patch(ENDPOINTS.SETTINGS_ORGANIZATION, data);
  },

  /**
   * Update notification preferences
   */
  async updateNotifications(data) {
    return client.patch(ENDPOINTS.SETTINGS_NOTIFICATIONS, data);
  },

  /**
   * Update appearance preferences (theme, sidebarDefault)
   */
  async updateAppearance(data) {
    return client.patch(ENDPOINTS.SETTINGS_APPEARANCE, data);
  },

  /**
   * Update timezone, language, and date format preferences
   */
  async updateRegion(data) {
    return client.patch(ENDPOINTS.SETTINGS_REGION, data);
  },

  /**
   * Update user account password
   */
  async changePassword(currentPassword, newPassword) {
    return client.post(ENDPOINTS.SETTINGS_SECURITY_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Toggle 2FA authentication state
   */
  async toggle2FA(enabled) {
    return client.post(ENDPOINTS.SETTINGS_SECURITY_2FA_TOGGLE, { enabled });
  },

  /**
   * List all personal access tokens
   */
  async listApiTokens() {
    return client.get(ENDPOINTS.SETTINGS_SECURITY_TOKENS);
  },

  /**
   * Update dual-mode execution preferences (Cloud vs Local, model, temperature, max tokens)
   */
  async updateExecution(data) {
    return client.patch(ENDPOINTS.SETTINGS_EXECUTION, data);
  },

  /**
   * Create a new personal access token
   */
  async createApiToken(name, expiresInDays, scopes = ['all']) {
    return client.post(ENDPOINTS.SETTINGS_SECURITY_TOKENS, {
      name,
      expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
      scopes,
    });
  },

  /**
   * Revoke an API token
   */
  async revokeApiToken(tokenId) {
    return client.delete(ENDPOINTS.SETTINGS_SECURITY_TOKEN_DELETE(tokenId));
  },

  /**
   * Export all workspace data as a JSON bundle
   */
  async exportWorkspaceData() {
    return client.post(ENDPOINTS.SETTINGS_EXPORT);
  },

  /**
   * Reset settings to factory defaults
   */
  async resetSettings() {
    return client.post(ENDPOINTS.SETTINGS_RESET);
  },
};

export default settingsService;
