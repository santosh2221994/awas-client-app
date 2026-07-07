import client from '../client';
import { ENDPOINTS } from '../endpoints';

export function listAgents() {
  return client.get(ENDPOINTS.AGENTS);
}

export function getAgent(id) {
  return client.get(`${ENDPOINTS.AGENTS}/${id}`);
}

export function createAgent(data) {
  return client.post(ENDPOINTS.AGENTS, data);
}

export function updateAgent(id, data) {
  return client.put(`${ENDPOINTS.AGENTS}/${id}`, data);
}
