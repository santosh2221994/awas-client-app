/**
 * api/services/llmModelsService.js
 *
 * API service layer for LLM Model Management (Page 14 — /llm-connections).
 * All requests route through the NestJS gateway at :3000 via the shared axios client.
 *
 * Endpoints consumed:
 *   GET  /ai/models              — provider catalogue + user configs + Mastra status
 *   GET  /ai/models/config       — user's saved configs only
 *   POST /ai/models/config       — save / update a provider config
 *   DELETE /ai/models/config/:id — remove a provider config
 *   POST /ai/models/test         — test a provider connection
 */

import client from '../client';
import { ENDPOINTS } from '../endpoints';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the full provider catalogue enriched with:
 * - Active status from Mastra engine
 * - User's saved configuration (masked API key, baseUrl, testStatus, etc.)
 *
 * @returns {Promise<Array>} Array of provider objects
 */
export async function fetchProviders() {
  return client.get(ENDPOINTS.LLM_MODELS);
}

/**
 * Fetches only the user's saved model configurations.
 * Useful for lightweight reads.
 *
 * @returns {Promise<Array>} Array of ModelConfig records (API keys masked)
 */
export async function fetchUserConfigs() {
  return client.get(ENDPOINTS.LLM_MODELS_CONFIG);
}

/**
 * Saves or updates a model provider configuration.
 *
 * @param {Object} config
 * @param {string} config.providerId  - Provider ID ('groq', 'gemini', 'ollama', 'openai', 'lm-studio')
 * @param {string} [config.apiKey]    - Plain-text API key (encoded server-side)
 * @param {string} [config.baseUrl]   - Custom base URL (Ollama/LM Studio/Azure)
 * @param {string} [config.modelId]   - Default model ID for this provider
 * @param {boolean} config.isEnabled  - Whether to enable this provider
 * @param {boolean} [config.isDefault]- Set as the global default provider
 *
 * @returns {Promise<Object>} Saved config with masked API key
 */
export async function saveProviderConfig(config) {
  return client.post(ENDPOINTS.LLM_MODELS_CONFIG_SAVE, config);
}

/**
 * Removes a saved provider configuration.
 *
 * @param {string} providerId - Provider ID to remove
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteProviderConfig(providerId) {
  return client.delete(ENDPOINTS.LLM_MODELS_CONFIG_DELETE(providerId));
}

/**
 * Tests connectivity for a given LLM provider.
 * The NestJS gateway proxies to Mastra, which performs the actual ping.
 *
 * @param {Object} opts
 * @param {string} opts.providerId - Provider to test
 * @param {string} [opts.apiKey]   - API key to use for the test (optional — uses saved key if omitted)
 * @param {string} [opts.baseUrl]  - Custom base URL for the test
 * @param {string} [opts.modelId]  - Specific model to test
 *
 * @returns {Promise<{success: boolean, latencyMs: number, message: string, modelId?: string}>}
 */
export async function testProviderConnection(opts) {
  return client.post(ENDPOINTS.LLM_MODELS_TEST, opts);
}

// ── Dedicated LLM Connection Module Methods (Stored in MongoDB llmConnection collection) ──

/**
 * Fetches all LLM connections directly from /llm-connection.
 */
export async function fetchLlmConnections() {
  return client.get(ENDPOINTS.LLM_CONNECTIONS);
}

/**
 * Saves or updates an LLM connection record in the `llmConnection` collection.
 */
export async function saveLlmConnection(connection) {
  return client.post(ENDPOINTS.LLM_CONNECTION_SAVE, connection);
}

/**
 * Deletes an LLM connection from the `llmConnection` collection.
 */
export async function deleteLlmConnection(providerId) {
  return client.delete(ENDPOINTS.LLM_CONNECTION_DELETE(providerId));
}

/**
 * Tests connection with round-trip latency and inference verification.
 */
export async function testLlmConnection(opts) {
  return client.post(ENDPOINTS.LLM_CONNECTION_TEST, opts);
}

/**
 * Syncs loaded models from provider (e.g. LM Studio) and persists into `llmConnection` collection.
 */
export async function syncLlmModels(providerId, baseUrl, apiKey) {
  return client.post(ENDPOINTS.LLM_CONNECTION_SYNC_MODELS, { providerId, baseUrl, apiKey });
}

/**
 * Directly fetches live models from LM Studio server at http://127.0.0.1:1234/v1/models.
 */
export async function fetchLmStudioLiveModels(baseUrl) {
  return client.get(ENDPOINTS.LLM_STUDIO_LIVE_MODELS, { params: { baseUrl } });
}

