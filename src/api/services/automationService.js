import client from '../client';
import { ENDPOINTS } from '../endpoints';

export function getAll() {
  return client.get(ENDPOINTS.AUTOMATIONS);
}

export function getById(id) {
  return client.get(`${ENDPOINTS.AUTOMATIONS}/${id}`);
}

export function create(data) {
  return client.post(ENDPOINTS.AUTOMATIONS, data);
}

export function update(id, data) {
  return client.put(`${ENDPOINTS.AUTOMATIONS}/${id}`, data);
}

export function deleteAutomation(id) {
  return client.delete(`${ENDPOINTS.AUTOMATIONS}/${id}`);
}

export function publish(id) {
  return client.post(`${ENDPOINTS.AUTOMATIONS}/${id}/publish`);
}
