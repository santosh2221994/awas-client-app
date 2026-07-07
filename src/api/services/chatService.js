import client from '../client';
import { ENDPOINTS } from '../endpoints';

export function sendMessage(automationId, text) {
  return client.post(ENDPOINTS.CHAT_MESSAGES(automationId), { text });
}

export function getHistory(automationId) {
  return client.get(ENDPOINTS.CHAT_MESSAGES(automationId));
}

export function clearHistory(automationId) {
  return client.delete(ENDPOINTS.CHAT_MESSAGES(automationId));
}
