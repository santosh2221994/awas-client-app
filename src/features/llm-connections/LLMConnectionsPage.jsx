

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Info,
  Loader2,
  Lock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Shield,
  Star,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  fetchProviders,
  saveProviderConfig,
  deleteProviderConfig,
  testProviderConnection,
  syncLlmModels,
} from '../../api/services/llmModelsService';
import Button from '../../components/Button';


const PROVIDER_META = {
  groq: {
    icon: '⚡',
    gradient: 'from-orange-500 to-amber-500',
    accentBg: 'bg-orange-50',
    accentBorder: 'border-orange-200',
    accentText: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    tagline: 'Ultra-fast LPU inference',
    tagIcon: <Zap className="w-3 h-3" />,
  },
  gemini: {
    icon: '✦',
    gradient: 'from-blue-500 to-indigo-600',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
    accentText: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    tagline: 'Multimodal reasoning',
    tagIcon: <Globe className="w-3 h-3" />,
  },
  ollama: {
    icon: '🦙',
    gradient: 'from-emerald-500 to-teal-600',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentText: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    tagline: 'Privacy-first local inference',
    tagIcon: <Lock className="w-3 h-3" />,
  },
  openai: {
    icon: '◆',
    gradient: 'from-slate-600 to-slate-800',
    accentBg: 'bg-slate-50',
    accentBorder: 'border-slate-200',
    accentText: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-700',
    tagline: 'Industry-standard GPT models',
    tagIcon: <Globe className="w-3 h-3" />,
  },
  'lm-studio': {
    icon: '🖥️',
    gradient: 'from-violet-500 to-purple-600',
    accentBg: 'bg-violet-50',
    accentBorder: 'border-violet-200',
    accentText: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    tagline: 'Local LM Studio at 127.0.0.1:1234',
    tagIcon: <Lock className="w-3 h-3" />,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ testStatus, isActiveInMastra }) {
  if (isActiveInMastra) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Active in Mastra
      </span>
    );
  }
  if (testStatus === 'ok') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
        <CheckCircle2 className="w-3 h-3" />
        Connected
      </span>
    );
  }
  if (testStatus === 'error') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
        <XCircle className="w-3 h-3" />
        Error
      </span>
    );
  }
  if (testStatus === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
        <Loader2 className="w-3 h-3 animate-spin" />
        Testing...
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
      <AlertCircle className="w-3 h-3" />
      Not Configured
    </span>
  );
}

function MaskedKeyDisplay({ maskedKey }) {
  const [revealed, setRevealed] = useState(false);
  if (!maskedKey) return <span className="text-gray-300 text-xs italic">No key saved</span>;
  return (
    <div className="flex items-center gap-1.5">
      <code className="font-mono text-[11px] text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
        {maskedKey}
      </code>
      <button
        onClick={() => setRevealed((v) => !v)}
        className="text-gray-400 hover:text-gray-600 transition"
        title={revealed ? 'Hide' : 'Show'}
      >
        {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider Card
// ─────────────────────────────────────────────────────────────────────────────

function ProviderCard({ provider, onSave, onDelete, onTest }) {
  const meta = PROVIDER_META[provider.providerId] ?? PROVIDER_META.groq;
  const cfg = provider.userConfig;

  const [expanded, setExpanded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [baseUrl, setBaseUrl] = useState(cfg?.baseUrl ?? provider.defaultBaseUrl ?? '');
  const [modelId, setModelId] = useState(cfg?.modelId ?? provider.models?.[0]?.modelId ?? '');
  const [isEnabled, setIsEnabled] = useState(cfg?.isEnabled ?? true);
  const [isDefault, setIsDefault] = useState(cfg?.isDefault ?? false);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [liveModels, setLiveModels] = useState(provider.models || []);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(null);

  const handleSyncModels = async () => {
    setSyncing(true);
    setSyncSuccess(null);
    try {
      const res = await syncLlmModels(provider.providerId, baseUrl || provider.defaultBaseUrl);
      const modelsList = res?.availableModels || res?.models || [];
      if (modelsList.length > 0) {
        const formatted = modelsList.map((m) => {
          const id = typeof m === 'string' ? m : m.modelId || m.id;
          return {
            modelId: id,
            label: m.label || m.name || id,
            name: m.name || m.displayName || id,
            device: m.device || m.primaryDevice,
            deviceTag: m.deviceTag,
            devices: m.devices,
            isRemote: m.isRemote ?? false,
            isLoaded: m.isLoaded ?? false,
            params: m.params,
            contextWindow: m.contextWindow || 8192,
            recommended: Boolean(m.recommended || id.includes('gemma-3-4b') || id.includes('gemma-4-12b')),
          };
        });
        setLiveModels(formatted);
        if (!modelId || !formatted.some((m) => m.modelId === modelId)) {
          setModelId(formatted[0].modelId);
        }
        const remoteCount = formatted.filter((m) => m.isRemote).length;
        const localCount = formatted.length - remoteCount;
        setSyncSuccess(
          `Synced ${formatted.length} models (${localCount} local, ${remoteCount} remote via LM Link)`
        );
        setTimeout(() => setSyncSuccess(null), 5000);
      } else {
        setSyncSuccess('No models loaded in LM Studio');
        setTimeout(() => setSyncSuccess(null), 4000);
      }
    } catch (err) {
      setSyncSuccess(`Sync failed: ${err.message}`);
      setTimeout(() => setSyncSuccess(null), 4000);
    } finally {
      setSyncing(false);
    }
  };


  const hasConfig = !!cfg;
  const testStatus = testing ? 'pending' : (testResult?.success === true ? 'ok' : testResult?.success === false ? 'error' : cfg?.testStatus ?? null);

    const handleSave = async () => {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      try {
        await onSave({
          providerId: provider.providerId,
          apiKey: apiKey || undefined,
          baseUrl: baseUrl || undefined,
          modelId: modelId || undefined,
          isEnabled,
          isDefault,
        });
        setApiKey('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        setSaveError(err?.message ?? 'Save failed');
      } finally {
        setSaving(false);
      }
    };

    const handleTest = async () => {
      setTesting(true);
      setTestResult(null);
      try {
        const result = await onTest({
          providerId: provider.providerId,
          apiKey: apiKey || undefined,
          baseUrl: baseUrl || provider.defaultBaseUrl,
          modelId: modelId || undefined,
        });
        setTestResult(result);
      } catch (err) {
        setTestResult({ success: false, message: err?.message ?? 'Test failed', latencyMs: 0 });
      } finally {
        setTesting(false);
      }
    };

    const handleDelete = async () => {
      if (!window.confirm(`Remove saved configuration for ${provider.displayName}?`)) return;
      setDeleting(true);
      try {
        await onDelete(provider.providerId);
      } finally {
        setDeleting(false);
      }
    };

    return (
      <div
        className={`bg-white border rounded-2xl shadow-xs overflow-hidden transition-all duration-200 ${provider.isActiveInMastra
          ? 'border-emerald-300 ring-1 ring-emerald-200'
          : isDefault && hasConfig
            ? 'border-indigo-200 ring-1 ring-indigo-100'
            : 'border-gray-200 hover:border-gray-300'
          }`}
      >
        {/* Card Header */}
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Provider icon */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white text-lg shadow-sm`}>
                {meta.icon}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-gray-900">{provider.displayName}</h3>
                  {isDefault && hasConfig && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                      <Star className="w-2.5 h-2.5" /> Default
                    </span>
                  )}
                  {provider.isActiveInMastra && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                      <Zap className="w-2.5 h-2.5" /> Mastra Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {meta.tagIcon}
                  <span className={`text-[10px] font-medium ${meta.accentText}`}>{meta.tagline}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge testStatus={testStatus} isActiveInMastra={provider.isActiveInMastra} />
              <button
                onClick={() => setExpanded((v) => !v)}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
              >
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Quick info row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {/* Active model */}
            {(provider.isActiveInMastra && provider.activeModelId) || (hasConfig && cfg?.modelId) ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                <Cpu className="w-3 h-3" />
                {provider.isActiveInMastra ? provider.activeModelId : cfg?.modelId}
              </span>
            ) : null}

            {/* Last tested */}
            {cfg?.lastTested && (
              <span className="text-[10px] text-gray-400">
                Last tested: {new Date(cfg.lastTested).toLocaleString()}
              </span>
            )}

            {/* API key status */}
            {provider.requiresApiKey && (
              <div className="flex items-center gap-1">
                {hasConfig && cfg?.hasApiKey ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    API key saved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-500">
                    <AlertCircle className="w-3 h-3" />
                    No API key
                  </span>
                )}
              </div>
            )}

            {/* Local provider note */}
            {!provider.requiresApiKey && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                <Lock className="w-3 h-3" />
                No API key required
              </span>
            )}

            {/* Docs link */}
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-[10px] text-indigo-500 hover:text-indigo-700 transition"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              Docs
            </a>
          </div>
        </div>

        {/* Expanded Config Panel */}
        {expanded && (
          <div className={`border-t ${meta.accentBorder} ${meta.accentBg} px-5 py-4 space-y-4`}>

            {/* Model selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                  Default Model
                </label>
                {provider.providerId === 'lm-studio' && (
                  <button
                    type="button"
                    onClick={handleSyncModels}
                    disabled={syncing}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition"
                    title="Query LM Studio at http://127.0.0.1:1234/v1/models"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Models from LM Studio'}
                  </button>
                )}
              </div>

              {/* LM Link Remote Cluster Banner */}
              {provider.providerId === 'lm-studio' && (() => {
                const currentList = liveModels?.length ? liveModels : (provider.models || []);
                const remoteList = currentList.filter((m) => m.isRemote);
                if (remoteList.length === 0) return null;
                const remoteNodes = Array.from(new Set(remoteList.flatMap((m) => m.devices || [m.device || 'Remote Node']))).filter((d) => d !== 'Local');
                return (
                  <div className="mb-2 flex items-center justify-between px-3 py-1.5 bg-purple-50/80 border border-purple-200/70 rounded-xl text-xs text-purple-900">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">🔗</span>
                      <span className="font-semibold text-[11px]">LM Link Cluster Active:</span>
                      <span className="text-[10px] text-purple-700 font-mono font-medium">
                        {remoteNodes.join(', ')}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      {remoteList.length} Remote Models
                    </span>
                  </div>
                );
              })()}

              {syncSuccess && (
                <p className="text-[10px] text-emerald-600 font-medium mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {syncSuccess}
                </p>
              )}

              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 transition font-mono"
              >
                {(() => {
                  const currentList = liveModels?.length ? liveModels : (provider.models || []);
                  const localList = currentList.filter((m) => !m.isRemote);
                  const remoteList = currentList.filter((m) => m.isRemote);

                  if (provider.providerId === 'lm-studio' && remoteList.length > 0) {
                    return (
                      <>
                        <optgroup label={`💻 Local Models (${localList.length})`}>
                          {localList.map((m) => (
                            <option key={m.modelId} value={m.modelId}>
                              {m.isLoaded ? '🟢 ' : ''}{m.modelId}{m.params ? ` (${m.params})` : ''}{m.recommended ? ' ★ recommended' : ''} — {(m.contextWindow / 1000).toFixed(0)}K ctx [Local]
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label={`☁️ Remote LM Link Models (${remoteList.length})`}>
                          {remoteList.map((m) => (
                            <option key={m.modelId} value={m.modelId}>
                              {m.modelId}{m.params ? ` (${m.params})` : ''}{m.recommended ? ' ★ recommended' : ''} — {(m.contextWindow / 1000).toFixed(0)}K ctx [Remote: {m.deviceTag || m.device || 'Network Node'}]
                            </option>
                          ))}
                        </optgroup>
                      </>
                    );
                  }

                  return currentList.map((m) => (
                    <option key={m.modelId} value={m.modelId}>
                      {m.isLoaded ? '🟢 ' : ''}{m.label || m.modelId}{m.recommended ? ' ★ recommended' : ''} — {(m.contextWindow / 1000).toFixed(0)}K ctx
                    </option>
                  ));
                })()}
              </select>
            </div>

            {/* API Key input (only for providers that need it) */}
            {provider.requiresApiKey && (
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  API Key {hasConfig && cfg?.hasApiKey && <span className="text-emerald-600 font-semibold ml-1">• Saved</span>}
                </label>
                {hasConfig && cfg?.hasApiKey && (
                  <div className="mb-2">
                    <MaskedKeyDisplay maskedKey={cfg.apiKeyMasked} />
                  </div>
                )}
                <div className="relative">
                  <input
                    type={apiKeyVisible ? 'text' : 'password'}
                    placeholder={hasConfig && cfg?.hasApiKey ? 'Enter new key to replace...' : `Enter ${provider.displayName} API key...`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full text-xs font-mono bg-white border border-gray-200 rounded-lg px-3 pr-9 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 transition placeholder-gray-300"
                  />
                  <button
                    onClick={() => setApiKeyVisible((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {apiKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Base URL (for configurable providers) */}
            {provider.supportsBaseUrl && (
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  {provider.providerId === 'ollama' ? 'Ollama Host URL' : 'Base URL / Endpoint'}
                </label>
                <input
                  type="url"
                  placeholder={provider.defaultBaseUrl ?? 'http://localhost:...'}
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 transition placeholder-gray-300"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Default: <code className="font-mono">{provider.defaultBaseUrl}</code>
                </p>
              </div>
            )}

            {/* Toggle: Enabled / Default */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setIsEnabled((v) => !v)}
                  className={`relative w-8 h-4 rounded-full transition-colors ${isEnabled ? 'bg-indigo-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs font-medium text-gray-600">Enabled</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setIsDefault((v) => !v)}
                  className={`relative w-8 h-4 rounded-full transition-colors ${isDefault ? 'bg-amber-400' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${isDefault ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs font-medium text-gray-600">Set as Default</span>
              </label>
            </div>

            {/* Test result banner */}
            {testResult && (
              <div className={`flex items-start gap-2 p-3 rounded-xl text-xs ${testResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                {testResult.success ? <Wifi className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> : <WifiOff className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                <div>
                  <span className="font-semibold">{testResult.success ? 'Connection successful' : 'Connection failed'}</span>
                  {' — '}{testResult.message}
                  {testResult.latencyMs > 0 && (
                    <span className="ml-1 text-[10px] opacity-70">({testResult.latencyMs}ms)</span>
                  )}
                </div>
              </div>
            )}

            {/* Save error */}
            {saveError && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl text-xs bg-red-50 border border-red-200 text-red-700">
                <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {saveError}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              {/* Test */}
              <button
                onClick={handleTest}
                disabled={testing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                {testing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Test Connection
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${saveSuccess
                  ? 'bg-emerald-500 text-white border border-emerald-500'
                  : 'bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700'
                  } disabled:opacity-50`}
              >
                {saving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                {saveSuccess ? 'Saved!' : 'Save Config'}
              </button>

              {/* Delete config */}
              {hasConfig && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition"
                >
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  Remove
                </button>
              )}
            </div>
          </div>
        )}

        {/* Available models list (collapsed preview) */}
        {!expanded && (
          <div className="px-5 pb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(liveModels?.length ? liveModels : (provider.models || [])).slice(0, 8).map((m) => (
                <span
                  key={m.modelId}
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md flex items-center gap-1 ${m.recommended
                    ? `${meta.badge} font-semibold`
                    : m.isRemote
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {m.isLoaded && <span className="text-[8px]">🟢</span>}
                  {m.isRemote && <span className="text-[8px]">☁️</span>}
                  <span>{m.modelId}</span>
                  {m.isRemote && (
                    <span className="text-[8px] font-semibold text-purple-500 font-sans">
                      ({m.deviceTag || m.device || 'Remote'})
                    </span>
                  )}
                </span>
              ))}
              {((liveModels?.length ? liveModels : (provider.models || [])).length ?? 0) > 8 && (
                <span className="text-[9px] text-gray-400">
                  +{((liveModels?.length ? liveModels : (provider.models || [])).length) - 8} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Main Page Component
  // ─────────────────────────────────────────────────────────────────────────────

  export default function LLMConnectionsPage() {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all' | 'cloud' | 'local' | 'configured'

    // ── Fetch provider list on mount ──────────────────────────────────────────

    const loadProviders = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProviders();
        setProviders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('[LLMConnectionsPage] Failed to load providers:', err);
        setError(err?.message ?? 'Failed to load providers. Is the backend running?');
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      loadProviders();
    }, [loadProviders]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleSave = useCallback(async (config) => {
      const result = await saveProviderConfig(config);
      // Refresh provider list to pick up new config
      await loadProviders();
      return result;
    }, [loadProviders]);

    const handleDelete = useCallback(async (providerId) => {
      await deleteProviderConfig(providerId);
      await loadProviders();
    }, [loadProviders]);

    const handleTest = useCallback(async (opts) => {
      return testProviderConnection(opts);
    }, []);

    // ── Derived stats ─────────────────────────────────────────────────────────

    const configuredCount = providers.filter((p) => p.userConfig?.hasApiKey || !p.requiresApiKey).length;
    const activeCount = providers.filter((p) => p.isActiveInMastra).length;
    const defaultProvider = providers.find((p) => p.userConfig?.isDefault);

    // ── Filtering ─────────────────────────────────────────────────────────────

    const LOCAL_PROVIDERS = ['ollama', 'lm-studio'];
    const filtered = providers.filter((p) => {
      const matchesSearch =
        p.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.providerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.models?.some((m) => m.label?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'cloud' && !LOCAL_PROVIDERS.includes(p.providerId)) ||
        (filterType === 'local' && LOCAL_PROVIDERS.includes(p.providerId)) ||
        (filterType === 'configured' && (p.userConfig?.hasApiKey || (!p.requiresApiKey && p.userConfig)));

      return matchesSearch && matchesFilter;
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center bg-slate-50 select-none">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading LLM providers from Mastra...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-slate-50/50 overflow-y-auto select-none">
        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200/80 px-8 py-6">
          <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                LLM Connections
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure and manage LLM providers available to your Mastra AI agents
              </p>
            </div>
            <button
              onClick={loadProviders}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">

          {/* ── Error banner ───────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Failed to load providers</p>
                <p className="text-red-600 text-xs mt-0.5">{error}</p>
                <button onClick={loadProviders} className="text-xs text-red-700 underline mt-1">Retry</button>
              </div>
            </div>
          )}

          {/* ── Summary Cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Providers', value: providers.length, cls: 'text-gray-900' },
              { label: 'Active in Mastra', value: activeCount, cls: 'text-emerald-600' },
              { label: 'Configured', value: configuredCount, cls: 'text-indigo-600' },
              { label: 'Default Provider', value: defaultProvider?.displayName ?? 'Not set', cls: 'text-amber-600', small: true },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className={`${s.small ? 'text-sm' : 'text-2xl'} font-bold ${s.cls}`}>{s.value}</div>
                <div className="text-[11px] text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Info Banner ─────────────────────────────────────────────────── */}
          <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-indigo-700 space-y-1">
              <p className="font-semibold text-indigo-800">Model routing in Mastra</p>
              <p>
                The provider marked <span className="font-bold">Mastra Active</span> is the one currently used by the AI engine (auto-resolved from environment variables).
                Configure and save a provider here to update what your agents use by default.
                Changes to API keys require a Mastra service restart to take effect.
              </p>
            </div>
          </div>

          {/* ── Filters ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Settings2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search providers or models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 transition placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'cloud', label: '☁️ Cloud' },
                { id: 'local', label: '🔒 Local' },
                { id: 'configured', label: '✓ Configured' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${filterType === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Provider Cards ───────────────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              {providers.length === 0 ? 'No providers loaded.' : 'No providers match your search.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((provider) => (
                <ProviderCard
                  key={provider.providerId}
                  provider={provider}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onTest={handleTest}
                />
              ))}
            </div>
          )}

          {/* ── Local Privacy Note ──────────────────────────────────────────── */}
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <Lock className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-emerald-700">
              <p className="font-semibold text-emerald-800 mb-0.5">Privacy Mode</p>
              <p>
                Ollama and LM Studio run <span className="font-bold">100% on your machine</span> — no data leaves your premises.
                Use these providers for mission-critical or sensitive tasks.
                Switch the execution mode to <span className="font-bold">🔒 Local</span> in any agent to route to your local provider.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

