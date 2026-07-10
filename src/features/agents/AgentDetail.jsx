import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Circle, Upload, Mic, Send } from 'lucide-react';
import { getAgentById, generateAgentResponse } from '../../api/services/agentService';
import Button from '../../components/Button';
import { useUIStore } from '../../stores/useUIStore';

const tabs = ['Chat', 'Editor', 'Evaluate', 'Review', 'Traces'];
const rightPanelTabs = ['Overview', 'Model Settings', 'Memory'];

export default function AgentDetail() {
  const { selectedAgentId, clearSelectedAgentId } = useUIStore();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Chat');
  const [activeRightTab, setActiveRightTab] = useState('Overview');
  const [selectedProvider, setSelectedProvider] = useState('OpenAI');
  const [selectedModel, setSelectedModel] = useState('GPT-4');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());
  const [models] = useState({
    OpenAI: ['GPT-4', 'GPT-3.5', 'GPT-4 Turbo'],
    Google: ['Gemini Pro', 'Gemini Ultra'],
    Anthropic: ['Claude 3 Opus', 'Claude 3 Sonnet'],
  });

  useEffect(() => {
    async function fetchAgent() {
      if (!selectedAgentId) return;
      setLoading(true);
      setError(null);
      setChatMessages([]);
      setThreadId(crypto.randomUUID());

      try {
        const data = await getAgentById(selectedAgentId);
        setAgent(data);
      } catch (err) {
        setError(err.message || 'Unable to load agent details.');
      } finally {
        setLoading(false);
      }
    }

    fetchAgent();
  }, [selectedAgentId]);

  if (!selectedAgentId) {
    return null;
  }

  const handleProviderChange = (e) => {
    const provider = e.target.value;
    setSelectedProvider(provider);
    setSelectedModel(models[provider]?.[0] || '');
  };

  const extractAssistantText = (payload) => {
    if (typeof payload === 'string') return payload;
    if (Array.isArray(payload)) {
      for (const item of payload) {
        const text = extractAssistantText(item);
        if (text) return text;
      }
      return '';
    }

    if (payload && typeof payload === 'object') {
      for (const key of ['output', 'message', 'content', 'text', 'result']) {
        const text = extractAssistantText(payload[key]);
        if (text) return text;
      }

      if (payload?.choices?.[0]?.message?.content) {
        return extractAssistantText(payload.choices[0].message.content);
      }

      if (payload?.messages?.length) {
        const lastMessage = payload.messages[payload.messages.length - 1];
        return extractAssistantText(lastMessage?.content || lastMessage?.text || lastMessage?.message);
      }
    }

    return '';
  };

  const handleSendMessage = async () => {
    const text = message.trim();
    if (!text || !selectedAgentId || isSending) return;

    const userMessage = { role: 'user', content: text };

    setChatMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsSending(true);

    try {
      const response = await generateAgentResponse(selectedAgentId, [userMessage], threadId);
      const assistantContent = extractAssistantText(response) || 'Sorry, I could not generate a response.';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (err) {
      console.error('Agent response failed', err);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: err.message || 'Unable to generate a response.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Chat':
        return (
          <div className="flex h-full flex-col">
            {chatMessages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-300">How can I help you today?</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {chatMessages.map((chat, index) => (
                  <div key={`${chat.role}-${index}`} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${chat.role === 'user' ? 'ml-auto bg-blue-600 text-white' : 'bg-gray-900 text-gray-200 border border-gray-800'}`}>
                    {chat.content}
                  </div>
                ))}
                {isSending && <div className="text-sm text-gray-500">Thinking...</div>}
              </div>
            )}
          </div>
        );
      case 'Editor':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="text-xl font-semibold">Agent Editor</div>
              <p className="mt-2 text-sm">Configure agent instructions and parameters here</p>
            </div>
          </div>
        );
      case 'Evaluate':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="text-xl font-semibold">Evaluation Metrics</div>
              <p className="mt-2 text-sm">Test and evaluate agent performance</p>
            </div>
          </div>
        );
      case 'Review':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="text-xl font-semibold">Review History</div>
              <p className="mt-2 text-sm">Review past conversations and decisions</p>
            </div>
          </div>
        );
      case 'Traces':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="text-xl font-semibold">Execution Traces</div>
              <p className="mt-2 text-sm">View detailed execution traces and logs</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-black text-white flex">
      {/* Left Sidebar - Chat History */}
      <div className="w-64 border-r border-gray-800 bg-black flex flex-col overflow-hidden">
        <div className="border-b border-gray-800 p-4">
          <Button variant="secondary" size="sm" className="w-full gap-2">
            <Plus className="w-4 h-4" /> New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs text-gray-400 px-3 py-2">Your conversations will appear here once you start chatting!</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-800 bg-black/95 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Agents /</span>
              <h1 className="text-lg font-semibold">{agent?.name || 'Agent'}</h1>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="text-sm text-gray-400 hover:text-white">Agents documentation</a>
              <Button variant="ghost" size="sm" onClick={clearSelectedAgentId}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 px-6 py-0">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-0 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab
                    ? 'text-white border-white'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              {renderTabContent()}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-800 p-6">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select 
                    value={selectedProvider} 
                    onChange={handleProviderChange}
                    className="rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-300 outline-none focus:border-gray-700"
                  >
                    <option>OpenAI</option>
                    <option>Google</option>
                    <option>Anthropic</option>
                  </select>
                  <select 
                    value={selectedModel} 
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-300 outline-none focus:border-gray-700 flex-1"
                  >
                    <option>Select model...</option>
                    {models[selectedProvider]?.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    placeholder="Enter your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && message.trim()) {
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 rounded-lg border border-gray-800 bg-black px-4 py-3 text-sm outline-none focus:border-gray-700"
                  />
                  <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-800 bg-black hover:bg-gray-900 transition" title="Upload file">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-800 bg-black hover:bg-gray-900 transition" title="Voice input">
                    <Mic className="w-5 h-5 text-gray-400" />
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 transition" 
                    title="Send message"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Agent Details */}
          <div className="w-96 border-l border-gray-800 bg-black flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-800 p-4">
              <div className="flex items-center gap-3 mb-4">
                <Circle className="w-8 h-8 text-gray-700" />
                <div>
                  <div className="font-semibold">{agent?.name || 'Agent'}</div>
                  <div className="text-xs text-gray-400">Share</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-800 px-4 py-2 flex gap-2 overflow-x-auto">
              {rightPanelTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRightTab(tab)}
                  className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded transition ${
                    activeRightTab === tab
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              {activeRightTab === 'Overview' && (
                <>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Description</div>
                    <p className="text-gray-300">{agent?.description || 'No description available.'}</p>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Memory</div>
                    <div className="flex items-center gap-2">
                      <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
                      <span className="text-gray-300">On</span>
                    </div>
                  </div>

                  {agent?.tools && agent.tools.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Tools</div>
                      <div className="space-y-1">
                        {agent.tools.map((tool, idx) => (
                          <div key={idx} className="text-gray-300 flex items-center gap-2">
                            <Circle className="w-1.5 h-1.5 text-gray-700" />
                            {tool.name || tool.id}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Workflows</div>
                    <p className="text-gray-400">No workflows</p>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Skills</div>
                    <div className="text-gray-300 flex items-center gap-2">
                      <Circle className="w-1.5 h-1.5 text-gray-700" />
                      mastra
                    </div>
                  </div>
                </>
              )}

              {activeRightTab === 'Model Settings' && (
                <>
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-3">Model Configuration</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model</span>
                      <span className="text-gray-200">{agent?.model || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Provider</span>
                      <span className="text-gray-200">{agent?.provider || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type</span>
                      <span className="text-gray-200">{agent?.type || 'N/A'}</span>
                    </div>
                  </div>
                </>
              )}

              {activeRightTab === 'Memory' && (
                <>
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-3">Memory Configuration</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Memory Enabled</span>
                      <span className="text-emerald-400">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Messages</span>
                      <span className="text-gray-200">15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Auto-generate Titles</span>
                      <span className="text-rose-400">No</span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full mt-4">
                    Edit Working Memory
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
