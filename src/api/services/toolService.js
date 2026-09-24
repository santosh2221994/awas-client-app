import client from '../client';
import { ENDPOINTS } from '../endpoints';

/**
 * Safely unwraps Axios response payload if not already unwrapped by response interceptors.
 */
function unwrap(res) {
  if (res && typeof res === 'object' && 'status' in res && 'config' in res && 'data' in res) {
    return res.data;
  }
  return res;
}

/**
 * Fetch all available tools from the platform, optionally filtered by category or search query.
 */
export async function listTools(category, query) {
  const params = {};
  if (category && category !== 'All') params.category = category;
  if (query) params.q = query;
  const res = await client.get(ENDPOINTS.TOOLS, { params });
  const raw = unwrap(res);
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.tools)) return raw.tools;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

/**
 * Fetch details and parameter schema for a specific tool.
 */
export async function getToolById(toolId) {
  const res = await client.get(ENDPOINTS.TOOL_BY_ID(toolId));
  return unwrap(res);
}

/**
 * Execute a tool in sandbox mode with provided inputs and user credentials.
 */
export async function executeTool(toolId, inputData) {
  const res = await client.post(ENDPOINTS.TOOL_EXECUTE(toolId), {
    inputData: inputData || {},
  });
  return unwrap(res);
}

/**
 * List configured tool connections and masked credentials for the user.
 */
export async function listToolConnections() {
  const res = await client.get(ENDPOINTS.TOOL_CONNECTIONS);
  const raw = unwrap(res);
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.connections)) return raw.connections;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

/**
 * Save or update tool credentials in MongoDB.
 */
export async function saveToolConnection(toolId, data) {
  const res = await client.post(ENDPOINTS.TOOL_CONNECTION_SAVE(toolId), data);
  return unwrap(res);
}

/**
 * Disconnect/delete tool credentials.
 */
export async function deleteToolConnection(toolId) {
  const res = await client.delete(ENDPOINTS.TOOL_CONNECTION_DELETE(toolId));
  return unwrap(res);
}

/**
 * Test connectivity of tool credentials against external APIs.
 */
export async function testToolConnection(toolId, data = {}) {
  const res = await client.post(ENDPOINTS.TOOL_CONNECTION_TEST(toolId), data);
  return unwrap(res);
}

