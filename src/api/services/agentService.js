import client from '../client';
import { ENDPOINTS } from '../endpoints';

function getLocalAgents() {
  const custom = localStorage.getItem('custom_agents');
  const customList = custom ? JSON.parse(custom) : [];
  return customList.map(agent => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    type: agent.type || 'Custom Agent',
    model: agent.model || 'gpt-4o',
    tools: agent.tools || [],
    price: agent.price || 'Free',
    username: agent.username || 'creator',
    sellOnMarketplace: agent.sellOnMarketplace
  }));
}

// Fetch pricing from awas-user backend (MongoDB) keyed by mastraId
function fetchPricingMap() {
  return client.get(ENDPOINTS.AUTH_AGENTS)
    .then((agents) => {
      const map = {};
      for (const a of (Array.isArray(agents) ? agents : [])) {
        if (a.mastraId) map[a.mastraId] = { price: a.price, username: a.username };
      }
      return map;
    })
    .catch(() => ({}));
}

export function listAgents() {
  return Promise.all([client.get(ENDPOINTS.AGENTS), fetchPricingMap()])
    .then(([data, pricingMap]) => {
      const agentList = Array.isArray(data) ? data : Object.values(data ?? {});

      const apiAgents = agentList.map((agent) => {
        const id = agent.id || agent.name;
        const meta = pricingMap[id];
        const rawPrice = meta?.price ?? agent.metadata?.price ?? agent.price;
        const formattedPrice = (rawPrice !== undefined && rawPrice !== null && rawPrice !== 'Free' && rawPrice !== 0)
          ? `$${rawPrice}`
          : 'Free';

        return {
          id,
          name: agent.name,
          description: agent.description,
          model: agent.modelId || agent.model || agent.modelName,
          type: agent.provider || agent.type,
          tools: Object.values(agent.tools || {}).map((t) => ({ name: (t.name || t.description || '').slice(0, 40), id: t.id })),
          price: formattedPrice,
          username: meta?.username || agent.metadata?.username || agent.username || 'creator',
        };
      });

      return [...getLocalAgents(), ...apiAgents];
    })
    .catch((err) => {
      console.warn('[listAgents] failed, falling back to local agents', err);
      return getLocalAgents();
    });
}

export function getAgentById(agentId) {
  if (agentId.startsWith('custom-')) {
    const custom = localStorage.getItem('custom_agents');
    const customList = custom ? JSON.parse(custom) : [];
    const matched = customList.find(a => a.id === agentId);
    return Promise.resolve({
      id: agentId,
      name: matched?.name || 'Unknown Agent',
      description: matched?.description || 'No description provided.',
      model: matched?.model || 'gpt-4o',
      type: matched?.type || 'Agent',
      provider: 'openai',
      instructions: 'You are a helpful assistant specialized in this workflow.',
      tools: matched?.tools || [],
      workspaceTools: [],
      browserTools: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return client.get(ENDPOINTS.AGENT_BY_ID(agentId))
    .then((agent) => ({
      id: agent.id || agent.name,
      name: agent.name,
      description: agent.description,
      model: agent.modelId || agent.model || agent.modelName,
      type: agent.provider || agent.type,
      provider: agent.provider,
      instructions: agent.instructions || agent.initialInstructions || '',
      tools: Object.values(agent.tools || {}).map((t) => ({
        id: t.id,
        name: t.name || t.description,
        description: t.description || '',
      })),
      workspaceTools: agent.workspaceTools || [],
      browserTools: agent.browserTools || [],
      status: agent.status || 'active',
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }))
    .catch((err) => {
      console.warn(`API getAgentById(${agentId}) failed`, err);
      throw err;
    });
}

export function generateAgentResponse(agentId, messages, threadId) {
  return client.post(
    ENDPOINTS.AGENT_GENERATE(agentId),
    {
      messages,
      memory: {
        thread: threadId,
        resource: 'default-user',
      },
    },
    { timeout: 120000 }
  );
}

export function streamAgentResponse(agentId, messages, requestOptions = {}) {
  return client.post(ENDPOINTS.AGENT_STREAM(agentId), {
    messages,
    ...requestOptions,
  });
}

export function getAgentThreads(agentId) {
  return client.get(`${ENDPOINTS.MEMORY_THREADS}?resourceId=${agentId}`).then((data) => data.threads || []);
}

export function getThreadMessages(threadId) {
  return client.get(ENDPOINTS.MEMORY_THREAD_MESSAGES(threadId)).then((data) => data.messages || []);
}

export function getLogs() {
  return client.get(`${ENDPOINTS.LOGS}?transportId=default`).then((data) => data.logs || []);
}
