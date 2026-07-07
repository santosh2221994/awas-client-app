import client from '../client';
import { ENDPOINTS } from '../endpoints';

export function login(credentials) {
  return client.post(ENDPOINTS.AUTH_LOGIN, credentials);
}

export function refreshToken() {
  return client.post(ENDPOINTS.AUTH_REFRESH);
}

export function getCurrentUser() {
  return client.get(ENDPOINTS.AUTH_ME);
}

export function logout() {
  return client.post(ENDPOINTS.AUTH_LOGOUT);
}
