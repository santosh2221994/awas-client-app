import client from '../client';
import { ENDPOINTS } from '../endpoints';

export function listTools() {
  return client.get(ENDPOINTS.TOOLS);
}

export function searchTools(query) {
  return client.get(ENDPOINTS.TOOLS, { params: { q: query } });
}

export function getToolsByCategory(category) {
  return client.get(ENDPOINTS.TOOLS, { params: { category } });
}
