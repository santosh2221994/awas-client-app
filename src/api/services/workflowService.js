/**
 * workflowService.js
 * CRUD operations for the Crew Studio workflow collection stored in MongoDB.
 * Replaces all `localStorage.getItem('crew_workflows')` usage.
 */
import client from '../client';
import { ENDPOINTS } from '../endpoints';

/**
 * Fetch all workflows from DB.
 * @returns {Promise<Array>}
 */
export function listWorkflows() {
  return client.get(ENDPOINTS.CREW_WORKFLOWS).catch((err) => {
    console.warn('[workflowService] listWorkflows failed, returning []', err);
    return [];
  });
}

/**
 * Get a single workflow by its frontend workflowId (e.g. "wf-1789470620862").
 * @param {string} workflowId
 * @returns {Promise<Object>}
 */
export function getWorkflow(workflowId) {
  return client.get(ENDPOINTS.CREW_WORKFLOW_BY_ID(workflowId));
}

/**
 * Save (upsert) a workflow. Creates if new, updates if exists.
 * @param {{ workflowId: string, name: string, description?: string, nodes?: any[], edges?: any[] }} data
 * @returns {Promise<Object>}
 */
export function saveWorkflow(data) {
  return client.post(ENDPOINTS.CREW_WORKFLOWS, data);
}

/**
 * Update only specific fields of a workflow (name, description, nodes, edges).
 * @param {string} workflowId
 * @param {Partial<{ name: string, description: string, nodes: any[], edges: any[] }>} data
 * @returns {Promise<Object>}
 */
export function updateWorkflow(workflowId, data) {
  return client.patch(ENDPOINTS.CREW_WORKFLOW_BY_ID(workflowId), data);
}

/**
 * Permanently delete a workflow from the database.
 * @param {string} workflowId
 * @returns {Promise<Object>}
 */
export function deleteWorkflow(workflowId) {
  return client.delete(ENDPOINTS.CREW_WORKFLOW_BY_ID(workflowId));
}
