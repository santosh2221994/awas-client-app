import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkflowHistoryStore = create(
  persist(
    (set, get) => ({
      history: [],
      
      addRunRecord: (record) => {
        const newRecord = {
          id: record.id || `run-${Date.now()}`,
          timestamp: record.timestamp || new Date().toISOString(),
          timeFormatted: record.timeFormatted || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          workflowName: record.workflowName || 'Workflow Execution',
          status: record.status || 'Success',
          agentCount: record.agentCount || 1,
          agentsUsed: record.agentsUsed || [],
          inputTopic: record.inputTopic || '',
          outputResult: record.outputResult || '',
          logs: record.logs || [],
          metrics: record.metrics || {
            duration: '1.20s',
            promptTokens: 150,
            completionTokens: 100,
            totalTokens: 250,
            cost: '$0.0035'
          }
        };

        set((state) => ({
          history: [newRecord, ...state.history]
        }));

        return newRecord;
      },

      getRunById: (id) => {
        return get().history.find((item) => item.id === id);
      },

      removeRunRecord: (id) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id)
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      }
    }),
    {
      name: 'workflow_execution_history_store'
    }
  )
);
